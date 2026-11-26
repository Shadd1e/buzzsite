/**
 * Rider portal mock API (DESIGN.md §10.2, individual rider portal). Every
 * call takes the rider's account session and only ever returns that rider's
 * own parcels, batches, pay, disputes and flags.
 *
 * - Individual riders work like a one-person partner: their data is in
 *   test-data/logistics/rider-portal.json and they see Rates, Payouts and
 *   Disputes & claims.
 * - Company riders read their company's data (parcels.json, batches.json,
 *   flags.json) filtered to themselves. Their company handles rates, pay and
 *   disputes, so those calls are forbidden for them.
 *
 * Batches are read-only: they change only in the rider's Buzz app.
 */
import { getRiderHome, PortalError, PORTAL_NOW, type RiderHome } from "./portal";
import { clone, db, respond } from "./source";
import type { AccountSession, Batch, Dispute, Flag, Parcel, RiderPayout, RiderProfileRecord, RiderRates } from "./types";

/** The fixtures' calendar day (WAT): "today" for tiles and payouts */
const TODAY = PORTAL_NOW.slice(0, 10);
const dayOf = (iso: string) => iso.slice(0, 10);

async function rider(session: AccountSession): Promise<RiderHome> {
  // Throws forbidden for pending accounts, deactivated riders and suspended companies
  return getRiderHome(session);
}

async function individualOnly(session: AccountSession): Promise<RiderHome> {
  const me = await rider(session);
  if (me.kind !== "individual") throw new PortalError("forbidden", "Your company handles this for you.");
  return me;
}

function parcelsFor(session: AccountSession, me: RiderHome): Parcel[] {
  const source = me.kind === "individual" ? db.riderPortal.parcels : db.parcels;
  return source.filter((p) => p.riderId === session.id);
}

const lastEventAt = (p: Parcel) => p.timeline[p.timeline.length - 1]?.at ?? "";
const deliveredAt = (p: Parcel) => p.timeline.find((e) => e.status === "delivered")?.at ?? null;

const IN_TRANSIT: Parcel["status"][] = ["picked_up", "in_transit", "out_for_delivery"];

/* ---------- overview ---------- */

export interface RiderOverview {
  kind: RiderHome["kind"];
  toCollect: number;
  inTransit: number;
  deliveredToday: number;
  /** Individual riders only: paid today (company riders are paid by their company) */
  earningsToday: number | null;
  activeBatch: Batch | null;
  recentScans: Array<{ trackingId: string; label: string; city: string; at: string }>;
}

export async function getRiderOverview(session: AccountSession): Promise<RiderOverview> {
  const me = await rider(session);
  const parcels = parcelsFor(session, me);
  const batches = batchesFor(session, me);
  const scans = parcels
    .flatMap((p) => p.timeline.filter((e) => e.by === "rider").map((e) => ({ trackingId: p.trackingId, label: e.label, city: e.city, at: e.at })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);
  const earningsToday =
    me.kind === "individual"
      ? db.riderPortal.payouts
          .filter((x) => x.accountId === session.id && x.status === "paid" && dayOf(x.deliveredAt) === TODAY)
          .reduce((sum, x) => sum + x.earnings, 0)
      : null;
  return respond({
    kind: me.kind,
    toCollect: parcels.filter((p) => p.status === "booked").length,
    inTransit: parcels.filter((p) => IN_TRANSIT.includes(p.status)).length,
    deliveredToday: parcels.filter((p) => {
      const at = deliveredAt(p);
      return at !== null && dayOf(at) === TODAY;
    }).length,
    earningsToday,
    activeBatch: batches.find((b) => !b.closedAt && b.status !== "delivered") ?? null,
    recentScans: scans,
  });
}

/* ---------- parcels ---------- */

export type RiderParcelFilter = "all" | "to_collect" | "in_transit" | "delivered" | "needs_attention";

const filterTest: Record<RiderParcelFilter, (p: Parcel) => boolean> = {
  all: () => true,
  to_collect: (p) => p.status === "booked",
  in_transit: (p) => IN_TRANSIT.includes(p.status) || p.status === "at_pickup_point",
  delivered: (p) => p.status === "delivered",
  needs_attention: (p) => ["failed_attempt", "disputed", "refused", "storage_expiring", "returned"].includes(p.status),
};

/** Only this rider's parcels, newest activity first. Search matches tracking ID or order ID. */
export async function listMyParcels(
  session: AccountSession,
  query: { filter?: RiderParcelFilter; search?: string } = {},
): Promise<Parcel[]> {
  const me = await rider(session);
  const q = (query.search ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const rows = parcelsFor(session, me)
    .filter(filterTest[query.filter ?? "all"])
    .filter((p) => !q || p.trackingId.includes(q) || p.orderId.includes(q))
    .sort((a, b) => lastEventAt(b).localeCompare(lastEventAt(a)));
  return respond(rows);
}

export async function getMyParcel(session: AccountSession, trackingId: string): Promise<Parcel | null> {
  const me = await rider(session);
  return respond(parcelsFor(session, me).find((p) => p.trackingId === trackingId) ?? null);
}

/* ---------- batches (read-only) ---------- */

function batchesFor(session: AccountSession, me: RiderHome): Batch[] {
  const source = me.kind === "individual" ? db.riderPortal.batches : db.batches;
  return clone(source.filter((b) => b.riderId === session.id));
}

export async function listRiderBatches(session: AccountSession): Promise<Batch[]> {
  const me = await rider(session);
  return respond(batchesFor(session, me).sort((a, b) => b.lastScan.at.localeCompare(a.lastScan.at)));
}

/* ---------- rates (individual riders) ---------- */

export async function getRiderRates(session: AccountSession): Promise<RiderRates> {
  await individualOnly(session);
  const r = db.riderPortal.rates.find((x) => x.accountId === session.id);
  if (!r) throw new PortalError("not_found", "No rates on record yet.");
  return respond(r);
}

/** What a buyer pays and what the rider earns for a trip, from the rider's own rates */
export function quoteFromRates(rates: Pick<RiderRates, "perKm" | "buzzPercent" | "modifiers">, km: number, modifiers: string[]): { earnings: number; buzzShare: number; buyerPays: number } {
  let base = rates.perKm * Math.max(0, km);
  for (const m of modifiers) base = Math.floor((base * (100 + (rates.modifiers[m] ?? 0))) / 100);
  const buzzShare = Math.round((base * rates.buzzPercent) / 100);
  return { earnings: base, buzzShare, buyerPays: base + buzzShare };
}

/* ---------- payouts (individual riders) ---------- */

export interface RiderPayouts {
  entries: RiderPayout[];
  paidToday: number;
  paidThisWeek: number;
  held: number;
}

export async function listRiderPayouts(session: AccountSession): Promise<RiderPayouts> {
  await individualOnly(session);
  const entries = db.riderPortal.payouts.filter((x) => x.accountId === session.id);
  // The fixtures' week: the 7 days up to and including today
  const weekStart = new Date(Date.parse(`${TODAY}T00:00:00+01:00`) - 6 * 86_400_000).toISOString().slice(0, 10);
  const paid = entries.filter((x) => x.status === "paid");
  return respond({
    entries,
    paidToday: paid.filter((x) => dayOf(x.deliveredAt) === TODAY).reduce((s, x) => s + x.earnings, 0),
    paidThisWeek: paid.filter((x) => dayOf(x.deliveredAt) >= weekStart).reduce((s, x) => s + x.earnings, 0),
    held: entries.filter((x) => x.status === "held").reduce((s, x) => s + x.earnings, 0),
  });
}

/* ---------- disputes & claims (individual riders) ---------- */

export interface RiderDispute extends Dispute {
  /** What the rider has said about it, if anything */
  response: { text: string; at: string } | null;
}

const RESPONSES_KEY = "buzz-rider-dispute-responses-v1";
let responses: Record<string, { text: string; at: string }> = {};
let responsesLoaded = false;

/** Browser only: keep test responses for the tab (sessionStorage), like the portal store */
function loadResponses() {
  if (responsesLoaded) return;
  responsesLoaded = true;
  try {
    const raw = typeof window !== "undefined" ? window.sessionStorage.getItem(RESPONSES_KEY) : null;
    if (raw) responses = JSON.parse(raw) as typeof responses;
  } catch {
    responses = {};
  }
}

function saveResponses() {
  try {
    if (typeof window !== "undefined") window.sessionStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
  } catch {
    // Storage blocked: the response lasts until reload.
  }
}

/** Tests call this between cases */
export function resetRiderResponses() {
  responses = {};
  responsesLoaded = true;
}

export async function listRiderDisputes(session: AccountSession): Promise<RiderDispute[]> {
  await individualOnly(session);
  loadResponses();
  const rows = db.riderPortal.disputes
    .filter((d) => d.partnerId === session.id)
    .map((d) => ({ ...d, response: responses[d.id] ?? null }))
    .sort((a, b) => Number(a.status === "resolved") - Number(b.status === "resolved") || a.windowEndsAt.localeCompare(b.windowEndsAt));
  return respond(rows);
}

/** The rider's side of an open dispute. Buzz reviews it with the chat and scan log. */
export async function respondToRiderDispute(session: AccountSession, disputeId: string, text: string, now: number = Date.now()): Promise<RiderDispute> {
  await individualOnly(session);
  loadResponses();
  const d = db.riderPortal.disputes.find((x) => x.id === disputeId && x.partnerId === session.id);
  if (!d) throw new PortalError("not_found", "That dispute isn't yours.");
  if (d.status === "resolved") throw new PortalError("conflict", "This dispute is already decided.");
  const clean = text.trim();
  if (clean.length < 10) {
    throw new PortalError("invalid", "Say what happened in a sentence or two.", { text: "Write at least 10 characters: what happened at delivery." });
  }
  responses[d.id] = { text: clean.slice(0, 1000), at: new Date(now).toISOString() };
  saveResponses();
  return respond({ ...d, response: responses[d.id] });
}

/* ---------- flags (about them) ---------- */

export async function listRiderFlags(session: AccountSession): Promise<Flag[]> {
  const me = await rider(session);
  const source = me.kind === "individual" ? db.riderPortal.flags : db.flags;
  return respond(
    source
      .filter((f) => f.riderId === session.id)
      .sort((a, b) => Number(a.status !== "open") - Number(b.status !== "open") || b.raisedAt.localeCompare(a.raisedAt)),
  );
}

/* ---------- profile ---------- */

export type RiderProfile =
  | ({ kind: "individual"; name: string; riderCode: string | null; email: string } & Omit<RiderProfileRecord, "accountId">)
  | {
      kind: "company_rider";
      name: string;
      riderCode: string;
      company: string;
      companyCode: string;
      phone: string;
      vehicle: string;
      rating: number | null;
      joined: string;
      checks: Array<{ label: string; done: boolean }>;
    };

export async function getRiderProfile(session: AccountSession): Promise<RiderProfile> {
  const me = await rider(session);
  if (me.kind === "individual") {
    const a = db.portal.accounts.find((x) => x.id === session.id)!;
    const rec = db.riderPortal.profiles.find((x) => x.accountId === session.id);
    if (!rec) throw new PortalError("not_found", "No profile on record yet.");
    const { accountId: _accountId, ...rest } = rec;
    void _accountId;
    return respond({ kind: "individual", name: a.name, riderCode: a.riderCode, email: a.email, ...rest });
  }
  const r = db.riders.find((x) => x.id === session.id)!;
  const partner = db.partners.find((p) => p.id === r.partnerId)!;
  return respond({
    kind: "company_rider",
    name: r.name,
    riderCode: r.riderCode,
    company: partner.name,
    companyCode: partner.companyCode,
    // Masked like everywhere else in the portal: the last four digits only
    phone: r.phone.replace(/\d(?=(?:\D*\d){4})/g, "•"),
    vehicle: r.vehicle,
    rating: r.rating,
    joined: r.joined,
    checks: r.verification.companyChecks,
  });
}
