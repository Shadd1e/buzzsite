import { db, respond } from "./source";
import type {
  AdminUser,
  Application,
  ApplicationStage,
  AuditEntry,
  Batch,
  Dispute,
  DisputeStatus,
  Flag,
  Hub,
  Parcel,
  ParcelStatus,
  Partner,
  Payout,
  PublicParcel,
  Rider,
  RiderStatus,
} from "./types";

/** Tracking IDs look like BZT-7Q4K-19XM. */
export const TRACKING_ID_PATTERN = /^BZT-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function normaliseTrackingId(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

/* ---------- Partners ---------- */

export async function listPartners(filter?: { status?: Partner["status"] }): Promise<Partner[]> {
  return respond(db.partners.filter((p) => !filter?.status || p.status === filter.status));
}

export async function getPartner(partnerId: string): Promise<Partner | null> {
  return respond(db.partners.find((p) => p.id === partnerId) ?? null);
}

export async function getPartnerByCompanyCode(companyCode: string): Promise<Partner | null> {
  const code = companyCode.trim().toUpperCase();
  return respond(db.partners.find((p) => p.companyCode === code) ?? null);
}

/** Accepts a partner id (`p1`) or a company code (`BZL-C-1042`). */
function resolvePartnerId(companyId: string): string | undefined {
  return db.partners.find((p) => p.id === companyId || p.companyCode === companyId)?.id;
}

/* ---------- Parcels ---------- */

export interface ParcelQuery {
  partnerId?: string;
  status?: ParcelStatus | ParcelStatus[];
  /** Matches tracking ID, order ID or batch ID */
  search?: string;
}

export async function listParcels(query: ParcelQuery = {}): Promise<Parcel[]> {
  const partnerId = query.partnerId ? resolvePartnerId(query.partnerId) : undefined;
  const statuses = query.status ? ([] as ParcelStatus[]).concat(query.status) : null;
  const needle = query.search?.trim().toUpperCase();
  return respond(
    db.parcels.filter(
      (p) =>
        (!query.partnerId || p.partnerId === partnerId) &&
        (!statuses || statuses.includes(p.status)) &&
        (!needle ||
          p.trackingId.includes(needle) ||
          p.orderId.includes(needle) ||
          (p.batchId ?? "").includes(needle)),
    ),
  );
}

/** Full parcel record, for the partner portal and admin console only. */
export async function getParcel(trackingId: string): Promise<Parcel | null> {
  const id = normaliseTrackingId(trackingId);
  return respond(db.parcels.find((p) => p.trackingId === id) ?? null);
}

export async function getParcelByOrderId(orderId: string): Promise<Parcel | null> {
  const id = orderId.trim().toUpperCase();
  return respond(db.parcels.find((p) => p.orderId === id) ?? null);
}

/**
 * The public tracking view. Privacy is enforced here, not in the page: no
 * rider name, phone or location, no receiver details, no codes.
 */
export async function getPublicTracking(trackingId: string): Promise<PublicParcel | null> {
  const id = normaliseTrackingId(trackingId);
  const p = db.parcels.find((x) => x.trackingId === id);
  if (!p) return respond(null);
  const partner = db.partners.find((x) => x.id === p.partnerId);
  const last = p.timeline.at(-1);
  const view: PublicParcel = {
    trackingId: p.trackingId,
    status: p.status,
    deliveryType: p.deliveryType,
    partnerName: partner?.name ?? "Buzz Logistics partner",
    route: p.route,
    lastScan: last ? { city: last.city, at: last.at } : null,
    timeline: p.timeline
      .map(({ status, label, city, at, viaBatch }) => ({ status, label, city, at, viaBatch }))
      .reverse(), // newest first (DESIGN.md §10.1)
    attempts: p.attempts,
    nextStep: p.nextStep,
    proof: p.proof,
    storage: p.storage,
  };
  return respond(view);
}

/* ---------- Riders ---------- */

export async function listRiders(
  companyId: string,
  filter?: { status?: RiderStatus },
): Promise<Rider[]> {
  const partnerId = resolvePartnerId(companyId);
  return respond(
    db.riders.filter(
      (r) => r.partnerId === partnerId && (!filter?.status || r.status === filter.status),
    ),
  );
}

/** Admin: search riders across every company by name or rider code. */
export async function searchRiders(search: string): Promise<Rider[]> {
  const needle = search.trim().toLowerCase();
  return respond(
    db.riders.filter(
      (r) => r.name.toLowerCase().includes(needle) || r.riderCode.toLowerCase().includes(needle),
    ),
  );
}

export async function getRider(riderId: string): Promise<Rider | null> {
  return respond(db.riders.find((r) => r.id === riderId) ?? null);
}

/* ---------- Hubs, batches ---------- */

export async function listHubs(companyId?: string): Promise<Hub[]> {
  const partnerId = companyId ? resolvePartnerId(companyId) : undefined;
  return respond(db.hubs.filter((h) => !companyId || h.partnerId === partnerId));
}

export async function listBatches(companyId: string): Promise<Batch[]> {
  const partnerId = resolvePartnerId(companyId);
  return respond(db.batches.filter((b) => b.partnerId === partnerId));
}

export async function getBatch(batchId: string): Promise<Batch | null> {
  return respond(db.batches.find((b) => b.id === batchId.toUpperCase()) ?? null);
}

/* ---------- Disputes, flags ---------- */

export async function listDisputes(
  filter: { partnerId?: string; status?: DisputeStatus } = {},
): Promise<Dispute[]> {
  const partnerId = filter.partnerId ? resolvePartnerId(filter.partnerId) : undefined;
  const items = db.disputes
    .filter(
      (d) =>
        (!filter.partnerId || d.partnerId === partnerId) &&
        (!filter.status || d.status === filter.status),
    )
    // Queue order: least time left in the 5-day window first.
    .toSorted((a, b) => a.windowEndsAt.localeCompare(b.windowEndsAt));
  return respond(items);
}

export async function getDispute(disputeId: string): Promise<Dispute | null> {
  return respond(db.disputes.find((d) => d.id === disputeId) ?? null);
}

export async function listFlags(filter: { partnerId?: string } = {}): Promise<Flag[]> {
  const partnerId = filter.partnerId ? resolvePartnerId(filter.partnerId) : undefined;
  return respond(db.flags.filter((f) => !filter.partnerId || f.partnerId === partnerId));
}

/* ---------- Applications, payouts ---------- */

export async function listApplications(filter?: { stage?: ApplicationStage }): Promise<Application[]> {
  return respond(db.applications.filter((a) => !filter?.stage || a.stage === filter.stage));
}

export async function getApplication(applicationId: string): Promise<Application | null> {
  return respond(db.applications.find((a) => a.id === applicationId) ?? null);
}

export async function listPayouts(companyId: string): Promise<Payout[]> {
  const partnerId = resolvePartnerId(companyId);
  return respond(db.payouts.filter((p) => p.partnerId === partnerId));
}

/* ---------- Admin ---------- */

export async function listAdminUsers(): Promise<AdminUser[]> {
  return respond(db.adminUsers);
}

export async function listAuditLog(): Promise<AuditEntry[]> {
  return respond(db.auditLog);
}
