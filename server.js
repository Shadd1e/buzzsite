// Buzz website server. No dependencies. Node 18+.
// Run:  ADMIN_PASSWORD="choose-a-long-password" node server.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  ADMIN_PASSWORD = crypto.randomBytes(9).toString("base64url");
  console.log("\nNo ADMIN_PASSWORD set. Temporary admin password for this run: " + ADMIN_PASSWORD + "\n");
}
fs.mkdirSync(DATA_DIR, { recursive: true });

// ---- storage (single JSON file, written atomically) ----
let db = { items: [], jobs: [], orders: [] };
try { db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch (e) {}
db.items = db.items || []; db.jobs = db.jobs || []; db.orders = db.orders || [];
let writing = Promise.resolve();
function save() {
  writing = writing.then(() => new Promise((res) => {
    const tmp = DB_FILE + ".tmp";
    fs.writeFile(tmp, JSON.stringify(db, null, 1), (err) => {
      if (err) { console.error("save failed", err); return res(); }
      fs.rename(tmp, DB_FILE, () => res());
    });
  }));
  return writing;
}

// ---- helpers ----
const FIELDS = {
  waitlist: { required: ["name", "city"], any: ["phone", "email"], allowed: ["name", "phone", "email", "city", "device", "interest"] },
  rider: { required: ["name", "phone", "area", "vehicle", "idType", "availability"], allowed: ["name", "phone", "email", "area", "vehicle", "idType", "availability", "experience"] },
  feedback: { required: ["type", "category", "message"], allowed: ["type", "category", "message", "name", "contact"] },
  application: { required: ["name", "email", "phone", "role", "message"], allowed: ["name", "email", "phone", "role", "link", "message"] },
  // Lost-phone suspension requests. Queued for priority human review; nothing is suspended automatically.
  suspend: { required: ["buzzId", "phone", "name", "a1", "altContact"], allowed: ["buzzId", "phone", "name", "q1", "a1", "q2", "a2", "contactPerson", "joined", "altContact", "callTime", "faceConsent", "face"] },
};
const PREFIX = { waitlist: "WL", rider: "RD", feedback: "FB", application: "AP", suspend: "SP" };
const STAGES = 5; // 0 placed, 1 confirmed, 2 packed, 3 with rider, 4 delivered; -1 cancelled
const digits10 = (v) => String(v || "").replace(/\D/g, "").slice(-10);
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ref = () => Array.from(crypto.randomBytes(6), (b) => ALPHA[b % ALPHA.length]).join("");
const clip = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, n);

const hits = new Map(); // ip -> [timestamps]
function limited(ip, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(ip, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some((t) => now - t < 3600e3)) hits.delete(k); }, 600e3).unref();

const sessions = new Map(); // token -> expiry
function newSession() { const t = crypto.randomBytes(24).toString("hex"); sessions.set(t, Date.now() + 12 * 3600e3); return t; }
function authed(req) {
  const m = /(?:^|; )buzz_admin=([a-f0-9]+)/.exec(req.headers.cookie || "");
  if (!m) return false;
  const exp = sessions.get(m[1]);
  if (!exp || exp < Date.now()) { sessions.delete(m[1]); return false; }
  return true;
}
function safeEq(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

function send(res, code, body, headers = {}) {
  const isObj = typeof body === "object" && !Buffer.isBuffer(body);
  res.writeHead(code, Object.assign({
    "Content-Type": isObj ? "application/json; charset=utf-8" : "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "X-Frame-Options": "DENY",
    "Cache-Control": "no-store",
  }, headers));
  res.end(isObj ? JSON.stringify(body) : body);
}
function readJSON(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > limit) { reject(Object.assign(new Error("Too large"), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || "{}")); } catch (e) { reject(Object.assign(new Error("Bad JSON"), { status: 400 })); } });
  });
}

// index.html is a page fragment (works as a preview artifact too), so wrap it here.
function page() {
  let html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  if (!/^\s*<!doctype/i.test(html)) {
    html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
      "<style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>" +
      html + "</body></html>";
    // The fragment opens with <title>/<meta>/<link>/<style> (head content); the parser starts <body> at the first body element.
  }
  return html;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  try {
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return send(res, 200, page(), { "Cache-Control": "no-cache" });
    }
    if (url.pathname === "/api/ping") return send(res, 200, { ok: true });

    if (req.method === "GET" && url.pathname === "/api/jobs") {
      return send(res, 200, { jobs: db.jobs.filter((j) => j.open) });
    }

    let m = /^\/api\/submit\/(waitlist|rider|feedback|application|suspend)$/.exec(url.pathname);
    if (m && req.method === "POST") {
      const kind = m[1], spec = FIELDS[kind];
      if (limited(ip + ":" + kind, kind === "suspend" ? 5 : 12, 3600e3)) return send(res, 429, { error: "Too many submissions from this connection. Please try again later." });
      const body = await readJSON(req, kind === "suspend" ? 260000 : 20000);
      if (body.website) return send(res, 200, { ref: PREFIX[kind] + "-" + ref() }); // honeypot: pretend success
      const data = {};
      for (const k of spec.allowed) {
        if (k === "face") { const f = String(body.face || ""); if (/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(f) && f.length < 200000 && body.faceConsent) data.face = f; continue; }
        const v = clip(body[k], k === "message" || k === "experience" ? 3000 : 300); if (v) data[k] = v;
      }
      for (const k of spec.required) if (!data[k]) return send(res, 400, { error: "Please fill in all required fields." });
      if (spec.any && !spec.any.some((k) => data[k])) return send(res, 400, { error: "Add a phone number or email." });
      if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return send(res, 400, { error: "That email address does not look right." });
      if (data.phone && data.phone.replace(/\D/g, "").length < 7) return send(res, 400, { error: "Enter a phone number we can reach." });
      if (data.link && !/^https?:\/\//i.test(data.link)) return send(res, 400, { error: "The link must start with http:// or https://" });
      const item = { id: PREFIX[kind] + "-" + ref(), kind, createdAt: new Date().toISOString(), status: "new", data };
      item.ref = item.id; db.items.unshift(item); await save();
      return send(res, 200, { ref: item.ref });
    }

    // ---- public order tracking ----
    if (url.pathname === "/api/track" && req.method === "POST") {
      if (limited("track:" + ip, 15, 10 * 60e3)) return send(res, 429, { error: "Too many lookups. Please wait a few minutes." });
      const b = await readJSON(req);
      const code = clip(b.code, 20).toUpperCase(), ph = digits10(b.phone);
      const o = db.orders.find((x) => x.code === code && ph.length >= 7 && digits10(x.phone) === ph);
      if (!o) return send(res, 404, { error: "We could not find an order with those details. Check the code and the phone number you used." });
      return send(res, 200, { order: { code: o.code, item: o.item, seller: o.seller, stage: o.stage, note: o.note, createdAt: o.createdAt, updatedAt: o.updatedAt, history: o.history } });
    }

    // ---- admin ----
    if (url.pathname === "/api/admin/login" && req.method === "POST") {
      if (limited("login:" + ip, 8, 15 * 60e3)) return send(res, 429, { error: "Too many attempts. Wait a few minutes." });
      const body = await readJSON(req);
      if (!safeEq(body.password || "", ADMIN_PASSWORD)) return send(res, 401, { error: "Wrong password." });
      const secure = (req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
      return send(res, 200, { ok: true }, { "Set-Cookie": `buzz_admin=${newSession()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure}` });
    }
    if (url.pathname.startsWith("/api/admin/")) {
      if (url.pathname === "/api/admin/logout") {
        const mm = /buzz_admin=([a-f0-9]+)/.exec(req.headers.cookie || ""); if (mm) sessions.delete(mm[1]);
        return send(res, 200, { ok: true }, { "Set-Cookie": "buzz_admin=; Max-Age=0; Path=/" });
      }
      if (!authed(req)) return send(res, 401, { error: "Please sign in." });
      if (url.pathname === "/api/admin/data" && req.method === "GET") return send(res, 200, { items: db.items, jobs: db.jobs, orders: db.orders });
      if ((m = /^\/api\/admin\/item\/([\w-]+)$/.exec(url.pathname)) && req.method === "PATCH") {
        const body = await readJSON(req), it = db.items.find((i) => i.id === m[1]);
        if (!it) return send(res, 404, { error: "Not found." });
        if (!["new", "reviewed", "done", "closed"].includes(body.status)) return send(res, 400, { error: "Bad status." });
        it.status = body.status; await save(); return send(res, 200, { ok: true });
      }
      if (url.pathname === "/api/admin/jobs" && req.method === "POST") {
        const b = await readJSON(req);
        const job = { title: clip(b.title, 120), team: clip(b.team, 80), location: clip(b.location, 80) || "Lagos", type: clip(b.type, 40) || "Full time", description: clip(b.description, 2500), open: b.open !== false };
        if (!job.title) return send(res, 400, { error: "Add a title." });
        if (b.id) { const j = db.jobs.find((x) => x.id === b.id); if (!j) return send(res, 404, { error: "Not found." }); Object.assign(j, job); }
        else { job.id = "J" + ref(); db.jobs.unshift(job); }
        await save(); return send(res, 200, { ok: true });
      }
      if ((m = /^\/api\/admin\/jobs\/([\w-]+)$/.exec(url.pathname)) && req.method === "DELETE") {
        db.jobs = db.jobs.filter((j) => j.id !== m[1]); await save(); return send(res, 200, { ok: true });
      }
      if (url.pathname === "/api/admin/orders" && req.method === "POST") {
        const b = await readJSON(req);
        const now = new Date().toISOString();
        if (b.code) { // update stage / note
          const o = db.orders.find((x) => x.code === b.code); if (!o) return send(res, 404, { error: "Not found." });
          const st = Number(b.stage); if (!(st === -1 || (st >= 0 && st < STAGES))) return send(res, 400, { error: "Bad stage." });
          const note = clip(b.note, 200);
          if (st !== o.stage || note !== (o.note || "")) { o.stage = st; o.note = note; o.updatedAt = now; o.history.push({ stage: st, at: now, note }); }
          await save(); return send(res, 200, { ok: true });
        }
        const o = { code: "BZ-" + ref(), item: clip(b.item, 160), seller: clip(b.seller, 120), buyer: clip(b.buyer, 120), phone: clip(b.phone, 24), stage: 0, note: "", createdAt: now, updatedAt: now };
        if (!o.item || digits10(o.phone).length < 7) return send(res, 400, { error: "Add the item and the buyer's phone number." });
        o.history = [{ stage: 0, at: now, note: "" }]; db.orders.unshift(o); await save(); return send(res, 200, { ok: true, code: o.code });
      }
      if ((m = /^\/api\/admin\/orders\/([\w-]+)$/.exec(url.pathname)) && req.method === "DELETE") {
        db.orders = db.orders.filter((o) => o.code !== m[1]); await save(); return send(res, 200, { ok: true });
      }
      return send(res, 404, { error: "Not found." });
    }
    return send(res, 404, "Not found");
  } catch (e) {
    send(res, e.status || 500, { error: e.status ? e.message : "Server error." });
    if (!e.status) console.error(e);
  }
});
server.listen(PORT, () => console.log("Buzz site running on http://localhost:" + PORT));
