/**
 * Partner portal mock API: sign in (password + 2FA, lockout), the two staff
 * levels, riders (register, verify, deactivate, reactivate), rider analytics,
 * today's stops, team and the activity log.
 *
 * Every call takes the signed-in session, is scoped to that session's company
 * and checks the role, the way the real backend must. A partner can never read
 * or change another company's riders.
 *
 * Writes go to an in-memory store seeded from test-data. In the browser the
 * portal shell connects sessionStorage (configurePortalPersistence) so changes
 * survive a reload, and "Reset test data" puts the seed back.
 */
import { can, LOCKOUT_MINUTES, MAX_CODE_ATTEMPTS, MAX_PASSWORD_ATTEMPTS, nextExpiry, type Permission } from "@/lib/portal-access";
import { clone, db, respond } from "./source";
import type {
  AccountReview,
  AccountSession,
  AccountType,
  Batch,
  CompanyRecord,
  Dispute,
  Payout,
  Flag,
  Hub,
  Parcel,
  Partner,
  PortalAccount,
  PortalAction,
  PortalActivity,
  PortalRole,
  PortalSession,
  PortalStaff,
  Rider,
  RiderDay,
  RiderStats,
  RiderStatus,
  Stop,
} from "./types";

/* ---------- errors ---------- */

export type PortalErrorCode = "forbidden" | "not_found" | "invalid" | "conflict";

export class PortalError extends Error {
  code: PortalErrorCode;
  /** Field-level problems for forms: { phone: "…" } */
  fields?: Record<string, string>;
  constructor(code: PortalErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "PortalError";
    this.code = code;
    this.fields = fields;
  }
}

/* ---------- store ---------- */

interface Lock {
  failures: number;
  lockedUntil: number | null;
}

interface Challenge {
  /** Company staff id, or a PortalAccount id when `account` is true */
  staffId: string;
  account?: boolean;
  expiresAt: number;
  attempts: number;
}

interface Store {
  riders: Rider[];
  staff: PortalStaff[];
  activity: PortalActivity[];
  checklists: Record<string, string[]>;
  locks: Record<string, Lock>;
  challenges: Record<string, Challenge>;
  /** Pending accounts' review state, keyed by account id (reschedules write here) */
  reviews: Record<string, AccountReview>;
  /** Partner operations: who a parcel was reassigned to, flag reviews, dispute responses, labels printed */
  assignments: Record<string, string>;
  flagReviews: Record<string, { note: string; at: string; by: string }>;
  disputeResponses: Record<string, { text: string; at: string; by: string }>;
  labelsPrinted: Record<string, string>;
}

const STORAGE_KEY = "buzz-portal-test-store-v3";

function seed(): Store {
  const checklists: Record<string, string[]> = {};
  for (const r of db.riders) {
    checklists[r.partnerId] ??= r.verification.companyChecks.map((c) => c.label);
  }
  return {
    riders: clone(db.riders),
    staff: clone(db.portal.staff),
    activity: clone(db.portal.activityLog),
    checklists,
    locks: {},
    challenges: {},
    reviews: Object.fromEntries(db.portal.accounts.filter((a) => a.review).map((a) => [a.id, clone(a.review!)])),
    assignments: {},
    flagReviews: {},
    disputeResponses: {},
    labelsPrinted: {},
  };
}

/** A rider or pending-account session, SESSION_IDLE_MINUTES long like the portal's */
function accountSession(kind: AccountSession["kind"], id: string, name: string, status: AccountSession["status"], now: number): AccountSession {
  return { kind, id, name, status, signedInAt: new Date(now).toISOString(), expiresAt: nextExpiry(now) };
}

let store: Store = seed();
let storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null = null;

/** Browser only: keep test changes across reloads (sessionStorage). */
export function configurePortalPersistence(s: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null) {
  storage = s;
  if (!s) return;
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (raw) store = { ...seed(), ...(JSON.parse(raw) as Partial<Store>) };
  } catch {
    store = seed();
  }
}

function persist() {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or blocked: changes still last until reload.
  }
}

/** Puts the seed data back. Tests call it between cases; the portal has a button for it. */
export function resetPortalStore() {
  store = seed();
  buzzRequests.clear();
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** The fixtures' clock: test data is a snapshot taken at this time. */
export const PORTAL_NOW = db.portal.now;

export interface TestAccount {
  name: string;
  email: string;
  accountType: AccountType;
  /** Approved company staff only */
  role: PortalRole | null;
  status: PortalStaff["status"] | PortalAccount["status"];
  /** Company name, or the individual rider code once issued */
  company: string | null;
  riderCode: string | null;
  /** Where signing in with this account goes, for testers */
  landsOn: string;
}

/** Plain-words destination for the test lists (matches the proxy and accountHome) */
const LANDS_ON = {
  portal: "Partner portal",
  review: "Review status page",
  rider: "Rider area",
} as const;

/** Shown on the sign-in screen and on /dev/test-ids */
export function listTestAccounts(): TestAccount[] {
  const staff: TestAccount[] = db.portal.staff.map((s) => ({
    name: s.name,
    email: s.email,
    accountType: "company",
    role: s.role,
    status: s.status,
    company: db.partners.find((p) => p.id === s.partnerId)?.name ?? s.partnerId,
    riderCode: null,
    landsOn:
      s.status !== "active"
        ? `Can't sign in (${s.status})`
        : db.partners.find((p) => p.id === s.partnerId)?.status !== "active"
          ? "Can't sign in (company suspended)"
          : LANDS_ON.portal,
  }));
  const others: TestAccount[] = db.portal.accounts.map((a) => ({
    name: a.name,
    email: a.email,
    accountType: a.accountType,
    role: null,
    status: a.status,
    company: a.company,
    riderCode: a.riderCode,
    landsOn: a.status === "pending_review" ? LANDS_ON.review : LANDS_ON.rider,
  }));
  return [...staff, ...others];
}

export const TEST_CREDENTIALS = db.portal.testCredentials;

/* ---------- helpers ---------- */

function authorize(session: PortalSession | null | undefined, permission: Permission): PortalSession {
  if (!session) throw new PortalError("forbidden", "Sign in to continue.");
  // The staff record is the source of truth: a removed account stops working
  // straight away, even with a session that hasn't expired.
  const staff = store.staff.find((s) => s.id === session.staffId);
  if (!staff || staff.status !== "active" || staff.partnerId !== session.partnerId) {
    throw new PortalError("forbidden", "This account no longer has access. Ask your super admin.");
  }
  if (!can(staff.role, permission)) {
    throw new PortalError("forbidden", "Your role can't do this. Ask a super admin.");
  }
  return { ...session, role: staff.role };
}

function log(session: PortalSession, action: PortalAction, summary: string, riderId?: string) {
  const entry: PortalActivity = {
    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    partnerId: session.partnerId,
    actorId: session.staffId,
    action,
    summary,
    ...(riderId ? { riderId } : {}),
  };
  store.activity.unshift(entry);
}

function companyRider(session: PortalSession, riderId: string): Rider {
  const r = store.riders.find((x) => x.id === riderId && x.partnerId === session.partnerId);
  // Another company's rider reads exactly like a missing one.
  if (!r) throw new PortalError("not_found", "We couldn't find that rider in your company.");
  return r;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomFrom(alphabet: string, n: number): string {
  const out: string[] = [];
  const bytes = new Uint8Array(n);
  globalThis.crypto.getRandomValues(bytes);
  for (const b of bytes) out.push(alphabet[b % alphabet.length]);
  return out.join("");
}

/** Rider codes look like R-QJGF-85 and are unique across every company. */
function newRiderCode(): string {
  for (;;) {
    const code = `R-${randomFrom(CODE_ALPHABET, 4)}-${randomFrom("0123456789", 2)}`;
    if (!store.riders.some((r) => r.riderCode === code)) return code;
  }
}

export const RIDER_CODE_PATTERN = /^R-[A-HJ-NP-Z2-9]{4}-\d{2}$/;

/**
 * Nigerian mobile numbers in any common form → "+234 800 000 1234".
 * Returns null when it isn't a valid number.
 */
export function normaliseNigerianPhone(input: string): string | null {
  let d = input.replace(/[\s\-()]/g, "");
  if (d.startsWith("+234")) d = d.slice(4);
  else if (d.startsWith("234")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  if (!/^[789]\d{9}$/.test(d)) return null;
  return `+234 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/* ---------- sign in ---------- */

export type SignInResult =
  | { ok: true; challenge: string }
  | { ok: false; reason: "invalid"; attemptsLeft: number }
  | { ok: false; reason: "locked"; lockedUntil: string }
  | { ok: false; reason: "no_access" }
  /** Right password, but the account is the other type. Safe to say: they proved the password. */
  | { ok: false; reason: "wrong_type"; accountType: AccountType };

/**
 * Step 1: email + password, for the account type chosen on the form. Wrong
 * email and wrong password give the same answer, so the form never confirms
 * which emails have accounts.
 */
export async function startSignIn(
  email: string,
  password: string,
  now: number = Date.now(),
  accountType: AccountType = "company",
): Promise<SignInResult> {
  const key = email.trim().toLowerCase();
  const lock = (store.locks[key] ??= { failures: 0, lockedUntil: null });

  if (lock.lockedUntil && lock.lockedUntil > now) {
    return respond({ ok: false, reason: "locked", lockedUntil: new Date(lock.lockedUntil).toISOString() });
  }
  if (lock.lockedUntil && lock.lockedUntil <= now) {
    lock.failures = 0;
    lock.lockedUntil = null;
  }

  const staff = store.staff.find((s) => s.email.toLowerCase() === key);
  const account = staff ? undefined : db.portal.accounts.find((a) => a.email.toLowerCase() === key);
  if ((!staff && !account) || password !== TEST_CREDENTIALS.password) {
    lock.failures += 1;
    if (lock.failures >= MAX_PASSWORD_ATTEMPTS) {
      lock.lockedUntil = now + LOCKOUT_MINUTES * 60_000;
      persist();
      return respond({ ok: false, reason: "locked", lockedUntil: new Date(lock.lockedUntil).toISOString() });
    }
    persist();
    return respond({ ok: false, reason: "invalid", attemptsLeft: MAX_PASSWORD_ATTEMPTS - lock.failures });
  }

  lock.failures = 0;
  const actualType: AccountType = staff ? "company" : account!.accountType;
  if (actualType !== accountType) {
    persist();
    return respond({ ok: false, reason: "wrong_type", accountType: actualType });
  }

  if (account) {
    // Pending accounts can sign in; they only reach the review status page.
    const challenge = randomFrom(CODE_ALPHABET, 24);
    store.challenges[challenge] = { staffId: account.id, account: true, expiresAt: now + 5 * 60_000, attempts: 0 };
    persist();
    return respond({ ok: true, challenge });
  }

  // Right password, but the account can't sign in (removed, or the invite
  // hasn't been accepted yet). Safe to say: they proved the password.
  const partner = staff && db.partners.find((p) => p.id === staff.partnerId);
  if (!staff || staff.status !== "active" || partner?.status !== "active") {
    persist();
    return respond({ ok: false, reason: "no_access" });
  }

  const challenge = randomFrom(CODE_ALPHABET, 24);
  store.challenges[challenge] = { staffId: staff.id, expiresAt: now + 5 * 60_000, attempts: 0 };
  persist();
  return respond({ ok: true, challenge });
}

/** A signed-in individual rider or pending company. Their screens come in later build steps. */
export interface SignedInAccount {
  accountType: AccountType;
  name: string;
  email: string;
  status: PortalAccount["status"];
  company: string | null;
  riderCode: string | null;
}

export type CodeResult =
  | { ok: true; session: PortalSession }
  /** Not approved company staff: an account session for the review page (or rider area) instead */
  | { ok: true; session: null; account: SignedInAccount; accountSession: AccountSession }
  | { ok: false; reason: "wrong_code"; attemptsLeft: number }
  | { ok: false; reason: "expired" };

/** Step 2: the 6-digit code. Three wrong codes and they start again. */
export async function completeSignIn(challenge: string, code: string, now: number = Date.now()): Promise<CodeResult> {
  const c = store.challenges[challenge];
  if (!c || c.expiresAt <= now) {
    delete store.challenges[challenge];
    persist();
    return respond({ ok: false, reason: "expired" });
  }
  if (code.replace(/\D/g, "") !== TEST_CREDENTIALS.code) {
    c.attempts += 1;
    if (c.attempts >= MAX_CODE_ATTEMPTS) {
      delete store.challenges[challenge];
      persist();
      return respond({ ok: false, reason: "expired" });
    }
    persist();
    return respond({ ok: false, reason: "wrong_code", attemptsLeft: MAX_CODE_ATTEMPTS - c.attempts });
  }

  delete store.challenges[challenge];
  if (c.account) {
    const a = db.portal.accounts.find((x) => x.id === c.staffId)!;
    persist();
    const kind = a.accountType === "company" ? "applicant" : "individual";
    return respond({
      ok: true,
      session: null,
      account: { accountType: a.accountType, name: a.name, email: a.email, status: a.status, company: a.company, riderCode: a.riderCode },
      accountSession: accountSession(kind, a.id, a.name, a.status, now),
    });
  }
  const staff = store.staff.find((s) => s.id === c.staffId)!;
  staff.lastSignInAt = new Date(now).toISOString();
  const session: PortalSession = {
    staffId: staff.id,
    partnerId: staff.partnerId,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    signedInAt: new Date(now).toISOString(),
    expiresAt: nextExpiry(now),
  };
  log(session, "signed_in", "Signed in");
  persist();
  return respond({ ok: true, session });
}

export async function recordSignOut(session: PortalSession): Promise<void> {
  if (store.staff.some((s) => s.id === session.staffId && s.status === "active")) {
    log(session, "signed_out", "Signed out");
    persist();
  }
  return respond(undefined);
}

/* ---------- rider sign in ---------- */

/**
 * Riders sign in on the website three ways (PRODUCT.md logistics rules):
 * a company rider with company code + rider code; an individual rider with
 * rider code + password, or with their Buzz ID, confirmed in the Buzz app.
 * A successful sign in returns who signed in and an account session: active
 * riders go to the rider area, pending individual riders to the review page.
 */
export interface RiderSignedIn {
  /** PortalAccount id (individual) or Rider id (company rider) */
  id: string;
  kind: "company_rider" | "individual";
  name: string;
  riderCode: string | null;
  company: string | null;
  status: "active" | "pending_review";
}

export type RiderSignInResult =
  | { ok: true; rider: RiderSignedIn; session: AccountSession }
  | { ok: false; reason: "invalid"; attemptsLeft: number }
  | { ok: false; reason: "locked"; lockedUntil: string }
  /** The company registered this rider but hasn't finished verifying them */
  | { ok: false; reason: "not_verified" }
  /** Deactivated or frozen rider, or the company is suspended */
  | { ok: false; reason: "inactive" }
  /** The code belongs to the other kind of rider */
  | { ok: false; reason: "other_kind"; kind: RiderSignedIn["kind"] };

function lockedResult(key: string, now: number): RiderSignInResult | null {
  const lock = (store.locks[key] ??= { failures: 0, lockedUntil: null });
  if (lock.lockedUntil && lock.lockedUntil > now) {
    return { ok: false, reason: "locked", lockedUntil: new Date(lock.lockedUntil).toISOString() };
  }
  if (lock.lockedUntil) {
    lock.failures = 0;
    lock.lockedUntil = null;
  }
  return null;
}

function failedResult(key: string, now: number): RiderSignInResult {
  const lock = (store.locks[key] ??= { failures: 0, lockedUntil: null });
  lock.failures += 1;
  if (lock.failures >= MAX_PASSWORD_ATTEMPTS) {
    lock.lockedUntil = now + LOCKOUT_MINUTES * 60_000;
    persist();
    return { ok: false, reason: "locked", lockedUntil: new Date(lock.lockedUntil).toISOString() };
  }
  persist();
  return { ok: false, reason: "invalid", attemptsLeft: MAX_PASSWORD_ATTEMPTS - lock.failures };
}

const normalCode = (v: string) => v.trim().toUpperCase().replace(/\s+/g, "");
const INDIVIDUAL_CODE = /^BZL-I-/;
const COMPANY_RIDER_CODE = /^R-/;

function individualResult(a: PortalAccount, now: number): { ok: true; rider: RiderSignedIn; session: AccountSession } {
  return {
    ok: true,
    rider: { id: a.id, kind: "individual", name: a.name, riderCode: a.riderCode, company: null, status: a.status },
    session: accountSession("individual", a.id, a.name, a.status, now),
  };
}

/** Company rider: the company code and the rider code the company gave them. */
export async function companyRiderSignIn(companyCode: string, riderCode: string, now: number = Date.now()): Promise<RiderSignInResult> {
  const cc = normalCode(companyCode);
  const rc = normalCode(riderCode);
  if (INDIVIDUAL_CODE.test(rc)) return respond({ ok: false, reason: "other_kind", kind: "individual" });
  const key = `rider:${rc}`;
  const locked = lockedResult(key, now);
  if (locked) return respond(locked);

  const partner = db.partners.find((p) => p.companyCode === cc);
  const rider = partner && store.riders.find((r) => r.partnerId === partner.id && r.riderCode.toUpperCase() === rc);
  if (!partner || !rider) return respond(failedResult(key, now));

  store.locks[key] = { failures: 0, lockedUntil: null };
  persist();
  if (rider.status === "pending_verification") return respond({ ok: false, reason: "not_verified" });
  if (rider.status !== "active" || partner.status !== "active") return respond({ ok: false, reason: "inactive" });
  return respond({
    ok: true,
    rider: { id: rider.id, kind: "company_rider", name: rider.name, riderCode: rider.riderCode, company: partner.name, status: "active" },
    session: accountSession("company_rider", rider.id, rider.name, "active", now),
  });
}

/** Individual rider: their own rider code and password. */
export async function individualRiderSignIn(riderCode: string, password: string, now: number = Date.now()): Promise<RiderSignInResult> {
  const rc = normalCode(riderCode);
  if (COMPANY_RIDER_CODE.test(rc)) return respond({ ok: false, reason: "other_kind", kind: "company_rider" });
  const key = `rider:${rc}`;
  const locked = lockedResult(key, now);
  if (locked) return respond(locked);

  const account = db.portal.accounts.find((a) => a.accountType === "individual" && a.riderCode?.toUpperCase() === rc);
  if (!account || password !== TEST_CREDENTIALS.password) return respond(failedResult(key, now));

  store.locks[key] = { failures: 0, lockedUntil: null };
  persist();
  return respond(individualResult(account, now));
}

/* Buzz ID sign in: Buzz sends a request to the rider's app; they confirm it there. */

interface BuzzRequest {
  accountId: string | null;
  expiresAt: number;
}

/** In memory only: a pending request doesn't survive a reload, like the real one. */
const buzzRequests = new Map<string, BuzzRequest>();
export const BUZZ_REQUEST_SECONDS = 120;
const BUZZ_ID = /^@[a-z0-9._]{3,30}$/;

export function normalBuzzId(value: string): string {
  const v = value.trim().toLowerCase();
  return v.startsWith("@") ? v : `@${v}`;
}

export type BuzzIdStart = { ok: true; requestId: string; expiresAt: string } | { ok: false; reason: "format" };

/**
 * Always answers the same way for a well-formed Buzz ID, so the page never
 * confirms which Buzz IDs have rider accounts. Only a real rider gets the
 * request in their app.
 */
export async function startBuzzIdSignIn(buzzId: string, now: number = Date.now()): Promise<BuzzIdStart> {
  const id = normalBuzzId(buzzId);
  if (!BUZZ_ID.test(id)) return respond({ ok: false, reason: "format" });
  const account = db.portal.accounts.find((a) => a.accountType === "individual" && a.buzzId === id);
  const requestId = randomFrom(CODE_ALPHABET, 24);
  const expiresAt = now + BUZZ_REQUEST_SECONDS * 1000;
  buzzRequests.set(requestId, { accountId: account?.id ?? null, expiresAt });
  return respond({ ok: true, requestId, expiresAt: new Date(expiresAt).toISOString() });
}

export type BuzzIdConfirm =
  | { ok: true; rider: RiderSignedIn; session: AccountSession }
  | { ok: false; reason: "expired" }
  /** Test build only: no rider account has this Buzz ID, so no app would get the request */
  | { ok: false; reason: "no_account" };

/** Test build: stands in for the rider tapping "Yes, it's me" in the Buzz app. */
export async function confirmBuzzIdSignIn(requestId: string, now: number = Date.now()): Promise<BuzzIdConfirm> {
  const req = buzzRequests.get(requestId);
  buzzRequests.delete(requestId);
  if (!req || req.expiresAt <= now) return respond({ ok: false, reason: "expired" });
  const account = req.accountId ? db.portal.accounts.find((a) => a.id === req.accountId) : undefined;
  if (!account) return respond({ ok: false, reason: "no_account" });
  return respond(individualResult(account, now));
}

export function cancelBuzzIdSignIn(requestId: string) {
  buzzRequests.delete(requestId);
}

export interface TestRider {
  kind: RiderSignedIn["kind"];
  name: string;
  companyCode: string | null;
  riderCode: string | null;
  buzzId: string | null;
  status: string;
  /** Where signing in with this rider goes, for testers */
  landsOn: string;
}

function companyRiderLandsOn(status: RiderStatus, partnerStatus: Partner["status"] | undefined): string {
  if (status === "pending_verification") return "Can't sign in (company hasn't verified them)";
  if (status !== "active" || partnerStatus !== "active") return `Can't sign in (${status.replace(/_/g, " ")})`;
  return LANDS_ON.rider;
}

/** Shown in the test-accounts list on the sign-in page and on /dev/test-ids */
export function listTestRiders(): TestRider[] {
  const company: TestRider[] = db.riders
    .filter((r) => ["r1", "r5", "r6", "r7"].includes(r.id))
    .map((r) => ({
      kind: "company_rider",
      name: r.name,
      companyCode: db.partners.find((p) => p.id === r.partnerId)?.companyCode ?? null,
      riderCode: r.riderCode,
      buzzId: null,
      status: r.status,
      landsOn: companyRiderLandsOn(r.status, db.partners.find((p) => p.id === r.partnerId)?.status),
    }));
  const individual: TestRider[] = db.portal.accounts
    .filter((a) => a.accountType === "individual")
    .map((a) => ({
      kind: "individual",
      name: a.name,
      companyCode: null,
      riderCode: a.riderCode,
      buzzId: a.buzzId,
      status: a.status,
      landsOn: a.status === "pending_review" ? `${LANDS_ON.review} (Buzz ID only, no rider code yet)` : LANDS_ON.rider,
    }));
  return [...company, ...individual];
}

/* ---------- review status (pending accounts) ---------- */

export interface ReviewStatus {
  kind: "company" | "individual";
  name: string;
  company: string | null;
  review: AccountReview;
}

function pendingAccount(session: AccountSession): PortalAccount {
  if (session.kind === "company_rider" || session.status !== "pending_review") {
    throw new PortalError("forbidden", "Only accounts in review have a review status.");
  }
  const a = db.portal.accounts.find((x) => x.id === session.id);
  if (!a || a.status !== "pending_review") throw new PortalError("forbidden", "This account isn't in review.");
  return a;
}

/** What a pending account sees after sign in (DESIGN.md §10.1 review status) */
export async function getReviewStatus(session: AccountSession): Promise<ReviewStatus> {
  const a = pendingAccount(session);
  const review = store.reviews[a.id];
  if (!review) throw new PortalError("not_found", "No review on record for this account.");
  return respond({ kind: a.accountType === "company" ? "company" : "individual", name: a.name, company: a.company, review: clone(review) });
}

/** Inspection slots for the next five weekdays after the fixtures' clock, 10:00 and 14:00 WAT */
export async function listInspectionSlots(session: AccountSession): Promise<string[]> {
  pendingAccount(session);
  const slots: string[] = [];
  const day = new Date(PORTAL_NOW);
  while (slots.length < 10) {
    day.setUTCDate(day.getUTCDate() + 1);
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const ymd = day.toISOString().slice(0, 10);
    slots.push(`${ymd}T10:00:00+01:00`, `${ymd}T14:00:00+01:00`);
  }
  return respond(slots);
}

export async function rescheduleInspection(session: AccountSession, at: string): Promise<AccountReview> {
  const a = pendingAccount(session);
  const review = store.reviews[a.id];
  if (!review?.inspection) throw new PortalError("conflict", "There's no inspection booked to move.");
  if (review.score !== null) throw new PortalError("conflict", "The inspection has already happened.");
  const slots = await listInspectionSlots(session);
  if (!slots.includes(at)) throw new PortalError("invalid", "That slot isn't available. Pick another.", { at: "Pick one of the times shown." });
  review.inspection = { ...review.inspection, at };
  persist();
  return respond(clone(review));
}

/* ---------- rider area ---------- */

export interface RiderHome {
  kind: "company_rider" | "individual";
  name: string;
  riderCode: string | null;
  company: string | null;
}

/** Who is signed in to the rider area. Their dashboard screens are later build steps. */
export async function getRiderHome(session: AccountSession): Promise<RiderHome> {
  if (session.status !== "active" || session.kind === "applicant") {
    throw new PortalError("forbidden", "The rider area is for active riders.");
  }
  if (session.kind === "company_rider") {
    const r = store.riders.find((x) => x.id === session.id);
    const partner = r && db.partners.find((p) => p.id === r.partnerId);
    if (!r || r.status !== "active" || partner?.status !== "active") throw new PortalError("forbidden", "This rider code isn't active.");
    return respond({ kind: "company_rider", name: r.name, riderCode: r.riderCode, company: partner.name });
  }
  const a = db.portal.accounts.find((x) => x.id === session.id);
  if (!a || a.status !== "active") throw new PortalError("forbidden", "This rider account isn't active.");
  return respond({ kind: "individual", name: a.name, riderCode: a.riderCode, company: null });
}

/* ---------- company ---------- */

export async function getPortalCompany(session: PortalSession): Promise<Partner> {
  const s = authorize(session, "view_overview");
  return respond(db.partners.find((p) => p.id === s.partnerId)!);
}

/** The current role, re-read from the staff record (a role can change mid-session). */
export async function getCurrentStaff(session: PortalSession): Promise<PortalStaff> {
  const s = authorize(session, "view_overview");
  return respond(store.staff.find((x) => x.id === s.staffId)!);
}

/* ---------- riders ---------- */

export async function listCompanyRiders(
  session: PortalSession,
  filter: { status?: RiderStatus; search?: string } = {},
): Promise<Rider[]> {
  const s = authorize(session, "view_riders");
  const needle = filter.search?.trim().toLowerCase();
  return respond(
    store.riders.filter(
      (r) =>
        r.partnerId === s.partnerId &&
        (!filter.status || r.status === filter.status) &&
        (!needle || r.name.toLowerCase().includes(needle) || r.riderCode.toLowerCase().includes(needle)),
    ),
  );
}

export async function getCompanyRider(session: PortalSession, riderId: string): Promise<Rider | null> {
  const s = authorize(session, "view_riders");
  return respond(store.riders.find((r) => r.id === riderId && r.partnerId === s.partnerId) ?? null);
}

export async function getVerificationChecklist(session: PortalSession): Promise<string[]> {
  const s = authorize(session, "view_riders");
  return respond(store.checklists[s.partnerId] ?? []);
}

/** Super admin: add a check the company does before confirming a rider. */
export async function addVerificationCheck(session: PortalSession, label: string): Promise<string[]> {
  const s = authorize(session, "edit_checklist");
  const clean = label.trim().replace(/\s+/g, " ");
  if (clean.length < 3) throw new PortalError("invalid", "Name the check in a few words, like “Address visited”.", { label: "Name the check in a few words, like “Address visited”." });
  const list = (store.checklists[s.partnerId] ??= []);
  if (list.some((l) => l.toLowerCase() === clean.toLowerCase())) {
    throw new PortalError("conflict", "That check is already on the list.", { label: "That check is already on the list." });
  }
  list.push(clean);
  persist();
  return respond(list);
}

export const VEHICLES = ["Motorbike", "Bicycle", "Car", "Van", "Truck"] as const;

export interface RegisterRiderInput {
  name: string;
  phone: string;
  vehicle: string;
  /** The company's checks and which were done */
  checks: Array<{ label: string; done: boolean }>;
  /** "We have verified this rider" */
  confirmed: boolean;
}

/**
 * Registers a rider and gives them a rider code. Buzz only needs the company
 * to confirm the rider is verified: with every check done and the box ticked
 * they're active; otherwise they wait in "Pending verification" and can't
 * sign in to the app yet.
 */
export async function registerRider(session: PortalSession, input: RegisterRiderInput): Promise<Rider> {
  const s = authorize(session, "register_rider");
  const fields: Record<string, string> = {};
  const name = input.name.trim().replace(/\s+/g, " ");
  if (name.length < 3 || !name.includes(" ")) fields.name = "Enter the rider's first and last name, as on their ID.";
  const phone = normaliseNigerianPhone(input.phone);
  if (!phone) fields.phone = "Enter a Nigerian mobile number, like 0800 000 1234 or +234 800 000 1234.";
  else if (store.riders.some((r) => r.partnerId === s.partnerId && r.phone === phone && r.status !== "deactivated")) {
    fields.phone = "Another rider in your company already uses this number.";
  }
  if (!(VEHICLES as readonly string[]).includes(input.vehicle)) fields.vehicle = "Choose the vehicle they'll ride or drive.";
  if (Object.keys(fields).length) throw new PortalError("invalid", "Check the highlighted fields.", fields);

  const required = store.checklists[s.partnerId] ?? [];
  const checks = required.map((label) => ({ label, done: !!input.checks.find((c) => c.label === label)?.done }));
  const verified = input.confirmed && checks.every((c) => c.done);

  const rider: Rider = {
    id: `r-${Date.now().toString(36)}${randomFrom("abcdefghjkmnpqrstuvwxyz", 3)}`,
    partnerId: s.partnerId,
    name,
    riderCode: newRiderCode(),
    phone: phone!,
    vehicle: input.vehicle,
    status: verified ? "active" : "pending_verification",
    verification: { confirmedByCompany: verified, companyChecks: checks },
    appSignedIn: false,
    scansToday: 0,
    rating: null,
    joined: new Date().toISOString().slice(0, 10),
  };
  store.riders.push(rider);
  log(s, "rider_registered", verified ? `Registered rider ${name}` : `Registered rider ${name} (waiting for verification)`, rider.id);
  persist();
  return respond(rider);
}

/** Finish verification for a pending rider. */
export async function verifyRider(
  session: PortalSession,
  riderId: string,
  input: { checks: Array<{ label: string; done: boolean }>; confirmed: boolean },
): Promise<Rider> {
  const s = authorize(session, "verify_rider");
  const r = companyRider(s, riderId);
  if (r.status !== "pending_verification") throw new PortalError("conflict", `${r.name} isn't waiting for verification.`);
  const required = store.checklists[s.partnerId] ?? [];
  const checks = required.map((label) => ({ label, done: !!input.checks.find((c) => c.label === label)?.done }));
  r.verification.companyChecks = checks;
  if (!input.confirmed || !checks.every((c) => c.done)) {
    persist();
    throw new PortalError("invalid", "Tick every check and confirm you've verified this rider. Progress is saved.");
  }
  r.verification.confirmedByCompany = true;
  r.status = "active";
  log(s, "rider_verified", `Verified rider ${r.name}`, r.id);
  persist();
  return respond(r);
}

export const DEACTIVATION_REASONS = [
  "Left the company",
  "Failed verification",
  "Repeated failed deliveries",
  "Conduct complaint",
  "Other",
] as const;

/** Stops the rider signing in and scanning. Their history is kept. */
export async function deactivateRider(session: PortalSession, riderId: string, reason: string): Promise<Rider> {
  const s = authorize(session, "deactivate_rider");
  const r = companyRider(s, riderId);
  if (r.status === "deactivated") throw new PortalError("conflict", `${r.name} is already deactivated.`);
  if (r.status === "frozen") throw new PortalError("conflict", `Buzz has frozen ${r.name}. Contact partner support to change this.`);
  const why = reason.trim();
  if (!why) throw new PortalError("invalid", "Choose a reason.", { reason: "Choose a reason." });
  r.status = "deactivated";
  r.deactivatedAt = new Date().toISOString().slice(0, 10);
  r.deactivatedReason = why;
  r.appSignedIn = false;
  log(s, "rider_deactivated", `Deactivated rider ${r.name}: ${why}`, r.id);
  persist();
  return respond(r);
}

/** Super admin only. The same rider code works again. */
export async function reactivateRider(session: PortalSession, riderId: string): Promise<Rider> {
  const s = authorize(session, "reactivate_rider");
  const r = companyRider(s, riderId);
  if (r.status !== "deactivated") throw new PortalError("conflict", `${r.name} isn't deactivated.`);
  r.status = r.verification.confirmedByCompany ? "active" : "pending_verification";
  delete r.deactivatedAt;
  delete r.deactivatedReason;
  log(s, "rider_reactivated", `Reactivated rider ${r.name}`, r.id);
  persist();
  return respond(r);
}

/* ---------- analytics ---------- */

export async function getRiderActivity(session: PortalSession, riderId: string): Promise<RiderDay[]> {
  const s = authorize(session, "view_riders");
  companyRider(s, riderId);
  return respond(db.portal.riderActivity.find((a) => a.riderId === riderId)?.days ?? []);
}

/** Totals and rates over the last `window` days of a rider's activity. Pure. */
export function summariseRiderDays(riderId: string, days: RiderDay[], window = 7): RiderStats {
  const recent = days.slice(-window);
  const sum = (k: keyof RiderDay) => recent.reduce((n, d) => n + (d[k] as number), 0);
  const delivered = sum("delivered");
  const failed = sum("failed");
  const onTime = sum("onTime");
  const attempts = delivered + failed;
  return {
    riderId,
    days: recent.length,
    delivered,
    failed,
    successRate: attempts ? delivered / attempts : null,
    onTimeRate: delivered ? onTime / delivered : null,
    scans: sum("scans"),
    km: sum("km"),
    avgPerDay: recent.length ? delivered / recent.length : 0,
  };
}

/** Every rider's stats for the window, plus the company totals per day. */
export async function getFleetStats(
  session: PortalSession,
  window = 7,
): Promise<{ riders: RiderStats[]; daily: RiderDay[]; fleet: RiderStats }> {
  const s = authorize(session, "view_riders");
  const ids = new Set(store.riders.filter((r) => r.partnerId === s.partnerId).map((r) => r.id));
  const activity = db.portal.riderActivity.filter((a) => ids.has(a.riderId));
  const riders = activity.map((a) => summariseRiderDays(a.riderId, a.days, window));

  const byDate = new Map<string, RiderDay>();
  for (const a of activity) {
    for (const d of a.days) {
      const t = byDate.get(d.date) ?? { date: d.date, delivered: 0, failed: 0, onTime: 0, scans: 0, km: 0, hoursOnline: 0 };
      t.delivered += d.delivered;
      t.failed += d.failed;
      t.onTime += d.onTime;
      t.scans += d.scans;
      t.km += d.km;
      t.hoursOnline += d.hoursOnline;
      byDate.set(d.date, t);
    }
  }
  const daily = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  return respond({ riders, daily, fleet: summariseRiderDays("fleet", daily, window) });
}

/* ---------- stops, parcels, flags, hubs ---------- */

export async function listStops(session: PortalSession, filter: { riderId?: string } = {}): Promise<Stop[]> {
  const s = authorize(session, "view_stops");
  const ids = new Set(store.riders.filter((r) => r.partnerId === s.partnerId).map((r) => r.id));
  return respond(
    db.portal.stops
      .filter((st) => ids.has(st.riderId) && (!filter.riderId || st.riderId === filter.riderId))
      .toSorted((a, b) => a.riderId.localeCompare(b.riderId) || a.seq - b.seq),
  );
}

export async function listCompanyHubs(session: PortalSession): Promise<Hub[]> {
  const s = authorize(session, "view_stops");
  return respond(db.hubs.filter((h) => h.partnerId === s.partnerId));
}

export async function listCompanyFlags(session: PortalSession): Promise<Flag[]> {
  const s = authorize(session, "view_overview");
  return respond(db.flags.filter((f) => f.partnerId === s.partnerId));
}

/** Parcels this company's rider has carried (scoped by the parcel's partner too). */
export async function listRiderParcels(session: PortalSession, riderId: string): Promise<Parcel[]> {
  const s = authorize(session, "view_riders");
  companyRider(s, riderId);
  return respond(db.parcels.filter((p) => p.riderId === riderId && p.partnerId === s.partnerId));
}

/* ---------- team and activity ---------- */

export async function listTeam(session: PortalSession): Promise<PortalStaff[]> {
  const s = authorize(session, "manage_team");
  return respond(store.staff.filter((x) => x.partnerId === s.partnerId));
}

export async function inviteManager(session: PortalSession, input: { name: string; email: string }): Promise<PortalStaff> {
  const s = authorize(session, "manage_team");
  const fields: Record<string, string> = {};
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  if (name.length < 3) fields.name = "Enter their full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Enter their work email, like name@company.com.";
  else if (store.staff.some((x) => x.email.toLowerCase() === email && x.status !== "removed")) {
    fields.email = "Someone on a Buzz Logistics team already uses this email.";
  }
  if (Object.keys(fields).length) throw new PortalError("invalid", "Check the highlighted fields.", fields);
  const member: PortalStaff = {
    id: `u-${Date.now().toString(36)}`,
    partnerId: s.partnerId,
    name,
    email,
    role: "manager",
    status: "invited",
    addedAt: new Date().toISOString().slice(0, 10),
    lastSignInAt: null,
  };
  store.staff.push(member);
  log(s, "team_invited", `Invited ${name} as a manager`);
  persist();
  return respond(member);
}

export async function removeTeamMember(session: PortalSession, staffId: string): Promise<PortalStaff> {
  const s = authorize(session, "manage_team");
  const m = store.staff.find((x) => x.id === staffId && x.partnerId === s.partnerId);
  if (!m || m.status === "removed") throw new PortalError("not_found", "That person isn't on your team.");
  if (m.id === s.staffId) throw new PortalError("conflict", "You can't remove yourself. Ask another super admin.");
  if (m.role === "super_admin") {
    throw new PortalError("conflict", "Super admins can only be changed by Buzz partner support.");
  }
  m.status = "removed";
  m.removedAt = new Date().toISOString();
  log(s, "team_removed", `Removed ${m.name} from the team`);
  persist();
  return respond(m);
}

export async function listActivity(session: PortalSession): Promise<Array<PortalActivity & { actorName: string }>> {
  const s = authorize(session, "view_activity");
  return respond(
    store.activity
      .filter((a) => a.partnerId === s.partnerId)
      .map((a) => ({ ...a, actorName: store.staff.find((x) => x.id === a.actorId)?.name ?? "Former team member" })),
  );
}

/** One rider's history (registered, verified, deactivated…). Any role that can see riders. */
export async function listRiderHistory(
  session: PortalSession,
  riderId: string,
): Promise<Array<PortalActivity & { actorName: string }>> {
  const s = authorize(session, "view_riders");
  companyRider(s, riderId);
  return respond(
    store.activity
      .filter((a) => a.partnerId === s.partnerId && a.riderId === riderId)
      .map((a) => ({ ...a, actorName: store.staff.find((x) => x.id === a.actorId)?.name ?? "Former team member" })),
  );
}

/* ==========================================================================
   Partner operations (DESIGN.md §10.2): parcels, labels, batches, hubs,
   rates, payouts, disputes, flags and the company record. Every call is
   scoped to the session's company and checks the role.
   ========================================================================== */

const DEPOT_ORDER = /^DPT-\d{6}$/;
/** Statuses where a rider can still be (re)assigned */
const ASSIGNABLE: Parcel["status"][] = ["booked", "picked_up", "in_transit", "at_pickup_point", "failed_attempt", "out_for_delivery"];

/** A company parcel with any reassignment applied */
function companyParcels(partnerId: string): Parcel[] {
  return db.parcels
    .filter((p) => p.partnerId === partnerId)
    .map((p) => (store.assignments[p.trackingId] ? { ...p, riderId: store.assignments[p.trackingId] } : p));
}

export type CompanyParcelFilter = "all" | "booked" | "moving" | "at_pickup_point" | "delivered" | "attention";

const COMPANY_FILTERS: Record<CompanyParcelFilter, (p: Parcel) => boolean> = {
  all: () => true,
  booked: (p) => p.status === "booked",
  moving: (p) => ["picked_up", "in_transit", "out_for_delivery"].includes(p.status),
  at_pickup_point: (p) => p.status === "at_pickup_point" || p.status === "storage_expiring",
  delivered: (p) => p.status === "delivered",
  attention: (p) => ["failed_attempt", "disputed", "refused", "returned", "storage_expiring"].includes(p.status),
};

export interface CompanyParcel extends Parcel {
  riderName: string | null;
  labelPrintedAt: string | null;
}

function withNames(p: Parcel): CompanyParcel {
  return {
    ...p,
    riderName: p.riderId ? (store.riders.find((r) => r.id === p.riderId)?.name ?? null) : null,
    labelPrintedAt: store.labelsPrinted[p.trackingId] ?? null,
  };
}

/** Parcels: filter chips and search by any code (tracking ID, order ID, batch) */
export async function listCompanyParcels(
  session: PortalSession,
  query: { filter?: CompanyParcelFilter; search?: string } = {},
): Promise<CompanyParcel[]> {
  const s = authorize(session, "view_parcels");
  const q = (query.search ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const last = (p: Parcel) => p.timeline[p.timeline.length - 1]?.at ?? "";
  return respond(
    companyParcels(s.partnerId)
      .filter(COMPANY_FILTERS[query.filter ?? "all"])
      .filter((p) => !q || p.trackingId.includes(q) || p.orderId.includes(q) || (p.batchId ?? "").includes(q))
      .sort((a, b) => last(b).localeCompare(last(a)))
      .map(withNames),
  );
}

export async function getCompanyParcel(session: PortalSession, trackingId: string): Promise<CompanyParcel | null> {
  const s = authorize(session, "view_parcels");
  const p = companyParcels(s.partnerId).find((x) => x.trackingId === trackingId);
  return respond(p ? withNames(p) : null);
}

/** Give a parcel to another active rider in this company */
export async function assignParcelRider(session: PortalSession, trackingId: string, riderId: string): Promise<CompanyParcel> {
  const s = authorize(session, "assign_rider");
  const p = companyParcels(s.partnerId).find((x) => x.trackingId === trackingId);
  if (!p) throw new PortalError("not_found", "We couldn't find that parcel in your company.");
  if (!ASSIGNABLE.includes(p.status)) throw new PortalError("conflict", "This parcel's journey is finished, so it can't change rider.");
  const r = companyRider(s, riderId);
  if (r.status !== "active") throw new PortalError("invalid", "Pick an active rider.", { riderId: `${r.name} isn't active, so they can't take parcels.` });
  store.assignments[trackingId] = riderId;
  log(s, "rider_assigned", `Gave ${trackingId} to ${r.name}`, r.id);
  persist();
  return respond(withNames({ ...p, riderId }));
}

/* ---------- labels ---------- */

export interface ThermalLabel {
  trackingId: string;
  orderId: string;
  from: string;
  destination: string;
  deliveryType: Parcel["deliveryType"];
  receiverName: string;
  companyCode: string;
  companyName: string;
  item: string;
}

/**
 * Generate label: a Depot order ID becomes the thermal label (QR of the
 * tracking ID, tracking ID, destination city). Only this company's orders.
 */
export async function getLabelForOrder(session: PortalSession, orderId: string): Promise<ThermalLabel> {
  const s = authorize(session, "print_label");
  const id = orderId.trim().toUpperCase().replace(/\s+/g, "");
  if (!DEPOT_ORDER.test(id)) {
    throw new PortalError("invalid", "That isn't a Depot order ID.", { orderId: "Depot order IDs look like DPT-238739: DPT, a dash and 6 digits." });
  }
  const p = companyParcels(s.partnerId).find((x) => x.orderId === id);
  // Another company's order reads exactly like a missing one
  if (!p) {
    throw new PortalError("not_found", "No order with that ID is booked with your company.", {
      orderId: "Check the ID on the Depot order. It must be booked with your company.",
    });
  }
  const partner = db.partners.find((x) => x.id === s.partnerId)!;
  return respond({
    trackingId: p.trackingId,
    orderId: p.orderId,
    from: p.route[0],
    destination: p.route[p.route.length - 1],
    deliveryType: p.deliveryType,
    receiverName: p.receiver.name,
    companyCode: partner.companyCode,
    companyName: partner.name,
    item: p.item,
  });
}

export async function recordLabelPrinted(session: PortalSession, trackingId: string, now: number = Date.now()): Promise<void> {
  const s = authorize(session, "print_label");
  if (!companyParcels(s.partnerId).some((p) => p.trackingId === trackingId)) throw new PortalError("not_found", "That parcel isn't in your company.");
  store.labelsPrinted[trackingId] = new Date(now).toISOString();
  log(s, "label_printed", `Printed the label for ${trackingId}`);
  persist();
  return respond(undefined);
}

/* ---------- batches (read-only) ---------- */

export interface CompanyBatch extends Batch {
  riderName: string;
}

/** Mother QR batches, with the history built from the children's scans when none is stored */
export async function listCompanyBatches(session: PortalSession): Promise<CompanyBatch[]> {
  const s = authorize(session, "view_batches");
  const rows = db.batches
    .filter((b) => b.partnerId === s.partnerId)
    .map((b) => {
      const history =
        b.history ??
        b.children
          .flatMap((c) =>
            (db.parcels.find((p) => p.trackingId === c.trackingId)?.timeline ?? [])
              .filter((e) => e.viaBatch || /unlink|batch/i.test(e.label))
              .map((e) => ({ event: `${c.trackingId}: ${e.label}`, city: e.city, at: e.at })),
          )
          .sort((x, y) => x.at.localeCompare(y.at));
      return { ...b, history, riderName: store.riders.find((r) => r.id === b.riderId)?.name ?? "Unknown rider" };
    })
    .sort((a, b) => b.lastScan.at.localeCompare(a.lastScan.at));
  return respond(rows);
}

/* ---------- hubs, rates ---------- */

export async function listPortalHubs(session: PortalSession): Promise<Hub[]> {
  const s = authorize(session, "view_hubs");
  return respond(db.hubs.filter((h) => h.partnerId === s.partnerId));
}

export interface CompanyRates {
  perKm: number;
  buzzPercent: number;
  modifiers: Record<string, number>;
  settlement: string;
}

export async function getCompanyRates(session: PortalSession): Promise<CompanyRates> {
  const s = authorize(session, "view_rates");
  const p = db.partners.find((x) => x.id === s.partnerId)!;
  return respond({ perKm: p.baseRatePerKm, buzzPercent: p.buzzPercent, modifiers: p.modifiers, settlement: p.settlement });
}

/* ---------- payouts (super admins) ---------- */

export interface CompanyPayouts {
  days: Payout[];
  paidToday: number;
  /** Buzz's share not settled yet (T+2) */
  buzzPending: number;
  months: Array<{ month: string; deliveries: number; earnings: number; buzzShare: number }>;
}

export async function listCompanyPayouts(session: PortalSession): Promise<CompanyPayouts> {
  const s = authorize(session, "view_payouts");
  const days = db.payouts.filter((x) => x.partnerId === s.partnerId).sort((a, b) => b.date.localeCompare(a.date));
  const today = PORTAL_NOW.slice(0, 10);
  const byMonth = new Map<string, { month: string; deliveries: number; earnings: number; buzzShare: number }>();
  for (const d of days) {
    const m = d.date.slice(0, 7);
    const t = byMonth.get(m) ?? { month: m, deliveries: 0, earnings: 0, buzzShare: 0 };
    t.deliveries += d.deliveries;
    t.earnings += d.partnerEarnings;
    t.buzzShare += d.buzzShare;
    byMonth.set(m, t);
  }
  return respond({
    days,
    paidToday: days.filter((d) => d.date === today).reduce((sum, d) => sum + d.partnerEarnings, 0),
    buzzPending: days.filter((d) => !d.buzzSettled).reduce((sum, d) => sum + d.buzzShare, 0),
    months: [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month)),
  });
}

/* ---------- disputes & claims ---------- */

export interface CompanyDispute extends Dispute {
  response: { text: string; at: string; by: string } | null;
}

export async function listCompanyDisputes(session: PortalSession): Promise<CompanyDispute[]> {
  const s = authorize(session, "view_disputes");
  return respond(
    db.disputes
      .filter((d) => d.partnerId === s.partnerId)
      .map((d) => ({ ...d, response: store.disputeResponses[d.id] ?? null }))
      .sort((a, b) => Number(a.status === "resolved") - Number(b.status === "resolved") || a.windowEndsAt.localeCompare(b.windowEndsAt)),
  );
}

/** The company's side of an open case. Buzz decides with the chat, scan log and proof. */
export async function respondToCompanyDispute(session: PortalSession, disputeId: string, text: string, now: number = Date.now()): Promise<CompanyDispute> {
  const s = authorize(session, "respond_dispute");
  const d = db.disputes.find((x) => x.id === disputeId && x.partnerId === s.partnerId);
  if (!d) throw new PortalError("not_found", "We couldn't find that case in your company.");
  if (d.status === "resolved") throw new PortalError("conflict", "This case is already decided.");
  const clean = text.trim();
  if (clean.length < 10) {
    throw new PortalError("invalid", "Say what happened in a sentence or two.", { text: "Write at least 10 characters: what your rider saw at delivery." });
  }
  store.disputeResponses[d.id] = { text: clean.slice(0, 1000), at: new Date(now).toISOString(), by: s.name };
  log(s, "dispute_responded", `Responded to ${d.id}`);
  persist();
  return respond({ ...d, response: store.disputeResponses[d.id] });
}

/* ---------- flags ---------- */

export interface CompanyFlag extends Flag {
  riderName: string;
  review: { note: string; at: string; by: string } | null;
}

function companyFlag(f: Flag): CompanyFlag {
  const review = store.flagReviews[f.id] ?? null;
  return {
    ...f,
    status: review ? "reviewed" : f.status,
    riderName: store.riders.find((r) => r.id === f.riderId)?.name ?? "Unknown rider",
    review,
  };
}

export async function listPortalFlags(session: PortalSession): Promise<CompanyFlag[]> {
  const s = authorize(session, "view_flags");
  return respond(
    db.flags
      .filter((f) => f.partnerId === s.partnerId)
      .map(companyFlag)
      .sort((a, b) => Number(a.status !== "open") - Number(b.status !== "open") || b.raisedAt.localeCompare(a.raisedAt)),
  );
}

/** Mark a flag reviewed with what was found */
export async function reviewFlag(session: PortalSession, flagId: string, note: string, now: number = Date.now()): Promise<CompanyFlag> {
  const s = authorize(session, "review_flag");
  const f = db.flags.find((x) => x.id === flagId && x.partnerId === s.partnerId);
  if (!f) throw new PortalError("not_found", "We couldn't find that flag in your company.");
  if (f.status !== "open" || store.flagReviews[f.id]) throw new PortalError("conflict", "This flag is already reviewed.");
  const clean = note.trim();
  if (clean.length < 5) throw new PortalError("invalid", "Add a short note.", { note: "Say what you found, in a few words." });
  store.flagReviews[f.id] = { note: clean.slice(0, 500), at: new Date(now).toISOString(), by: s.name };
  log(s, "flag_reviewed", `Reviewed ${f.id}: ${f.label}`, f.riderId);
  persist();
  return respond(companyFlag(f));
}

/* ---------- company ---------- */

export interface CompanyProfile {
  partner: Partner;
  record: CompanyRecord;
}

export async function getCompanyProfile(session: PortalSession): Promise<CompanyProfile> {
  const s = authorize(session, "view_company");
  const partner = db.partners.find((x) => x.id === s.partnerId)!;
  const record = db.companies.find((x) => x.partnerId === s.partnerId);
  if (!record) throw new PortalError("not_found", "No company record on file yet.");
  return respond({ partner, record });
}
