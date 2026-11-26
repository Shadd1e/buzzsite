/**
 * Sign up mock API (DESIGN.md §10.1): partner apply (7 steps) and individual
 * rider apply (6 steps). Company riders never sign up: their company
 * registers them in the partner portal.
 *
 * Validation lives here, the way the real API will check it, and returns
 * error keys per field. The UI turns keys into words (content/onboarding.ts).
 * Submitting returns a reference; nothing is sent in the test build.
 */
import { normaliseNigerianPhone, PORTAL_NOW, PortalError } from "./portal";
import { db, respond } from "./source";
import type { ServiceType } from "./types";

export type FieldErrors = Record<string, string>;

/* ---------- drafts ---------- */

export interface UploadedFile {
  fileName: string;
}

export interface PartnerDraft {
  legalName: string;
  cac: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  confirm: boolean;
  services: ServiceType[];
  states: string[];
  countries: string[];
  vehicles: string[];
  riders: string;
  vehicleCount: string;
  hubs: string;
  years: string;
  tracking: string;
  documents: Record<string, UploadedFile | null>;
  perKm: string;
  modifiers: Record<string, string>;
  slot: string | null;
}

export interface RiderDraft {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  idType: string;
  idNumber: string;
  buzzId: string;
  vehicleType: string;
  plate: string;
  model: string;
  year: string;
  papers: Array<{ id: string; name: string; file: UploadedFile | null }>;
  photos: Record<string, UploadedFile | null>;
  documents: Record<string, UploadedFile | null>;
  perKm: string;
  slot: string | null;
}

export function emptyPartnerDraft(documents: string[]): PartnerDraft {
  return {
    legalName: "",
    cac: "",
    address: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    confirm: false,
    services: [],
    states: [],
    countries: [],
    vehicles: [],
    riders: "",
    vehicleCount: "",
    hubs: "",
    years: "",
    tracking: "",
    documents: Object.fromEntries(documents.map((d) => [d, null])),
    perKm: "",
    modifiers: { fragile: "0", highValueOver500k: "0", oversize: "0" },
    slot: null,
  };
}

export function emptyRiderDraft(documents: string[], photos: string[]): RiderDraft {
  return {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    idType: "",
    idNumber: "",
    buzzId: "",
    vehicleType: "",
    plate: "",
    model: "",
    year: "",
    papers: [{ id: "p1", name: "", file: null }],
    photos: Object.fromEntries(photos.map((p) => [p, null])),
    documents: Object.fromEntries(documents.map((d) => [d, null])),
    perKm: "",
    slot: null,
  };
}

/* ---------- checks ---------- */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAC = /^(RC|BN)[- ]?(TEST-)?\d{4,8}$/i;
const BUZZ_ID = /^@[a-z0-9._]{3,30}$/;
const WHOLE = /^\d{1,6}$/;

/** True when a sign-in account already uses this email (staff or rider/applicant) */
function emailInUse(email: string): boolean {
  const e = email.trim().toLowerCase();
  return db.portal.staff.some((s) => s.email.toLowerCase() === e) || db.portal.accounts.some((a) => a.email.toLowerCase() === e);
}

function rate(v: string): boolean {
  const n = Number(v);
  return v.trim() !== "" && Number.isFinite(n) && n >= 50 && n <= 2000;
}

/** Errors for one partner step (0-based). Keys match content/onboarding.ts errors. */
export function checkPartnerStep(step: number, d: PartnerDraft): FieldErrors {
  const e: FieldErrors = {};
  if (step === 0) {
    if (d.legalName.trim().length < 3) e.legalName = "legalName";
    if (!CAC.test(d.cac.trim())) e.cac = "cac";
    if (d.address.trim().length < 8) e.address = "address";
    if (d.contactName.trim().split(/\s+/).length < 2) e.contactName = "contactName";
    if (!EMAIL.test(d.contactEmail.trim())) e.contactEmail = "contactEmail";
    else if (emailInUse(d.contactEmail)) e.contactEmail = "emailTaken";
    if (!normaliseNigerianPhone(d.contactPhone)) e.contactPhone = "contactPhone";
    if (!d.confirm) e.confirm = "confirm";
  }
  if (step === 1) {
    if (d.services.length === 0) e.services = "services";
    if (d.states.length === 0) e.states = "states";
    if (d.services.includes("international") && d.countries.length === 0) e.countries = "countries";
    if (d.vehicles.length === 0) e.vehicles = "vehicles";
  }
  if (step === 2) {
    for (const k of ["riders", "vehicleCount", "hubs", "years"] as const) if (!WHOLE.test(d[k].trim())) e[k] = "number";
    if (!e.riders && Number(d.riders) < 1) e.riders = "ridersMin";
  }
  if (step === 3) {
    for (const [name, file] of Object.entries(d.documents)) if (!file) e[`doc:${name}`] = "document";
  }
  if (step === 4) {
    if (!rate(d.perKm)) e.perKm = "perKm";
    for (const [k, v] of Object.entries(d.modifiers)) {
      const n = Number(v);
      if (v.trim() === "" || !Number.isFinite(n) || n < 0 || n > 100) e[`mod:${k}`] = "modifier";
    }
  }
  if (step === 5 && !d.slot) e.slot = "slot";
  return e;
}

export function checkRiderStep(step: number, d: RiderDraft): FieldErrors {
  const e: FieldErrors = {};
  if (step === 0) {
    if (d.fullName.trim().split(/\s+/).length < 2) e.fullName = "fullName";
    if (!normaliseNigerianPhone(d.phone)) e.phone = "phone";
    if (!EMAIL.test(d.email.trim())) e.email = "email";
    else if (emailInUse(d.email)) e.email = "emailTaken";
    if (d.address.trim().length < 8) e.address = "address";
    if (!d.idType) e.idType = "idType";
    if (!d.idNumber.trim()) e.idNumber = "idNumber";
    else if (d.idType === "nin" && !/^\d{11}$/.test(d.idNumber.replace(/\s/g, ""))) e.idNumber = "nin";
    const b = d.buzzId.trim().toLowerCase();
    if (b && !BUZZ_ID.test(b.startsWith("@") ? b : `@${b}`)) e.buzzId = "buzzId";
  }
  if (step === 1) {
    if (!d.vehicleType) e.vehicleType = "vehicleType";
    if (d.vehicleType !== "Bicycle" && d.plate.trim().length < 4) e.plate = "plate";
    if (d.model.trim().length < 2) e.model = "model";
    const y = Number(d.year);
    if (!/^\d{4}$/.test(d.year.trim()) || y < 1990 || y > 2027) e.year = "year";
    if (d.papers.length === 0) e.papers = "papers";
    for (const p of d.papers) {
      if (!p.name.trim()) e[`paperName:${p.id}`] = "paperName";
      if (!p.file) e[`paperFile:${p.id}`] = "paperFile";
    }
    for (const [name, file] of Object.entries(d.photos)) if (!file) e[`photo:${name}`] = "photo";
  }
  if (step === 2) {
    for (const [name, file] of Object.entries(d.documents)) if (!file) e[`doc:${name}`] = "document";
  }
  if (step === 3 && !rate(d.perKm)) e.perKm = "perKm";
  if (step === 4 && !d.slot) e.slot = "slot";
  return e;
}

/* ---------- slots ---------- */

/** Free slots for the next 10 weekdays after the fixtures' clock (WAT) */
export async function listOnboardingSlots(kind: "meeting" | "inspection"): Promise<string[]> {
  const times = kind === "meeting" ? ["10:00", "11:30", "14:00", "15:30"] : ["09:00", "11:00", "14:00"];
  const out: string[] = [];
  const day = new Date(PORTAL_NOW);
  let days = 0;
  while (days < 10) {
    day.setUTCDate(day.getUTCDate() + 1);
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    days += 1;
    const ymd = day.toISOString().slice(0, 10);
    // A few slots are already taken, so the picker shows real gaps
    times.forEach((t, i) => {
      if ((days + i) % 5 !== 0) out.push(`${ymd}T${t}:00+01:00`);
    });
  }
  return respond(out);
}

/* ---------- submit ---------- */

function reference(prefix: string): string {
  const n = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${n}`;
}

/** Re-checks every step, the way the server will. Throws with the first failing step. */
export async function submitPartnerApplication(d: PartnerDraft): Promise<{ reference: string }> {
  for (let step = 0; step < 6; step++) {
    const errors = checkPartnerStep(step, d);
    if (Object.keys(errors).length) throw Object.assign(new PortalError("invalid", "Some answers need fixing.", errors), { step });
  }
  return respond({ reference: reference("APP") });
}

export async function submitRiderApplication(d: RiderDraft): Promise<{ reference: string }> {
  for (let step = 0; step < 5; step++) {
    const errors = checkRiderStep(step, d);
    if (Object.keys(errors).length) throw Object.assign(new PortalError("invalid", "Some answers need fixing.", errors), { step });
  }
  return respond({ reference: reference("RDR") });
}
