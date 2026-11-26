/**
 * Shapes of the mock data. They mirror test-data/*.json today and are the
 * contract a real backend has to meet later.
 */

/* ---------- Logistics ---------- */

export type ParcelStatus =
  | "booked"
  | "picked_up"
  | "in_transit"
  | "at_pickup_point"
  | "out_for_delivery"
  | "delivered"
  | "failed_attempt"
  | "returned"
  | "disputed"
  | "refused"
  | "storage_expiring";

export type DeliveryType = "home" | "pickup";

export interface TimelineEvent {
  status: ParcelStatus;
  label: string;
  city: string;
  /** ISO 8601 with WAT offset */
  at: string;
  by: "Buzz" | "rider" | "hub" | string;
  viaBatch?: boolean;
  manualEntry?: boolean;
}

export interface Receiver {
  name: string;
  preferredContact: "buzz" | "phone";
  verificationQuestion: string;
}

export interface Parcel {
  trackingId: string;
  orderId: string;
  partnerId: string;
  riderId: string | null;
  status: ParcelStatus;
  deliveryType: DeliveryType;
  item: string;
  declaredValue: number;
  seller: string;
  receiver: Receiver;
  route: string[];
  distanceKm: number;
  pricing: { base: number; buzzPercent: number; total: number };
  batchId: string | null;
  timeline: TimelineEvent[];
  attempts?: number;
  nextStep?: string;
  escrow?: { status: string; autoReleaseAt?: string };
  proof?: { photo: boolean; deliveryCodeVerified: boolean };
  storage?: { freeDays: number; dayNumber: number; feeAfter: number; returnAfterDays: number };
  pickupDelegate?: { name: string; codeActive: boolean; codeExpiresAt: string };
}

/**
 * What the public tracking page may show. PRODUCT.md logistics rules: status,
 * last scan city and time, and partner name. Never a rider's name, phone or
 * live location, and never the receiver's details or codes.
 */
export interface PublicParcel {
  trackingId: string;
  status: ParcelStatus;
  deliveryType: DeliveryType;
  partnerName: string;
  route: string[];
  lastScan: { city: string; at: string } | null;
  timeline: Array<Pick<TimelineEvent, "status" | "label" | "city" | "at" | "viaBatch">>;
  attempts?: number;
  nextStep?: string;
  proof?: { photo: boolean; deliveryCodeVerified: boolean };
  storage?: Parcel["storage"];
  /** Where to collect it, when it's waiting at a pickup point (a hub, never a rider) */
  pickupPoint?: { name: string; address: string; hours: string; city: string } | null;
}

export type PartnerStatus = "active" | "suspended";
export type ServiceType = "intrastate" | "interstate" | "international";

export interface Partner {
  id: string;
  name: string;
  companyCode: string;
  status: PartnerStatus;
  services: ServiceType[];
  states: string[];
  countries?: string[];
  baseRatePerKm: number;
  buzzPercent: number;
  modifiers: Record<string, number>;
  inspectionScore: number;
  rating: number;
  riders: number;
  joined: string;
  contact: { name: string; email: string; phone: string };
  payoutBank: string;
  settlement: "immediate" | "T+2" | string;
  suspendedReason?: string;
}

export type RiderStatus = "active" | "pending_verification" | "deactivated" | "frozen";

export interface Rider {
  id: string;
  partnerId: string;
  name: string;
  riderCode: string;
  phone: string;
  vehicle: string;
  status: RiderStatus;
  verification: {
    confirmedByCompany: boolean;
    companyChecks: Array<{ label: string; done: boolean }>;
  };
  appSignedIn: boolean;
  scansToday: number;
  /** Buyer rating out of 5. Null until the rider has rated deliveries. */
  rating: number | null;
  joined: string;
  deactivatedAt?: string;
  deactivatedReason?: string;
  frozenBy?: string;
  frozenReason?: string;
}

export interface Hub {
  id: string;
  partnerId: string;
  name: string;
  city: string;
  address: string;
  hours: string;
  pickupPoint: boolean;
  storageFeePerDayAfterFree: number;
}

export interface Batch {
  id: string;
  partnerId: string;
  riderId: string;
  route: string[];
  autoLinked: boolean;
  status: ParcelStatus;
  lastScan: { city: string; at: string };
  /** unlinkedAt is the place; unlinkedTime when it happened */
  children: Array<{ trackingId: string; status: ParcelStatus; unlinkedAt: string | null; unlinkedTime?: string }>;
  openedAt?: string;
  closedAt?: string;
  /** Every link, unlink and mother scan, oldest first */
  history?: Array<{ event: string; city: string; at: string }>;
}

export type DisputeStatus = "open" | "awaiting_partner" | "awaiting_seller" | "resolved";

export interface EvidenceMessage {
  from: "buyer" | "seller" | "system";
  name: string;
  text: string;
  at: string;
}

export interface Dispute {
  id: string;
  trackingId: string;
  orderId: string;
  partnerId: string;
  reason: string;
  openedAt: string;
  windowEndsAt: string;
  status: DisputeStatus;
  amount: number;
  faultAssigned: "buzz" | "partner" | null;
  decision: "release" | "refund" | "partial_refund" | null;
  evidence: { chat: EvidenceMessage[]; photos: number; deliveryCodeVerified: boolean };
}

export type FlagType =
  | "off_route"
  | "other_company_scan"
  | "silent_48h"
  | "no_delivery_code"
  | "manual_entry";

export interface Flag {
  id: string;
  type: FlagType;
  label: string;
  trackingId: string;
  partnerId: string;
  riderId: string;
  raisedAt: string;
  status: "open" | "reviewed" | string;
}

/* ---------- Partner portal: company record ---------- */

export interface CompanyRecord {
  partnerId: string;
  cac: string;
  address: string;
  documents: Array<{ name: string; status: DocumentState; uploadedAt: string; note?: string }>;
  /** Physical inspection of offices, hubs and fleet; parts weighted to the overall score */
  inspection: { at: string; score: number; breakdown: Array<{ label: string; weight: number; score: number }> };
}

/* ---------- Individual rider portal ---------- */

export interface RiderProfileRecord {
  accountId: string;
  phone: string;
  area: string;
  vehicle: { type: string; model: string; year: number; plate: string };
  documents: Array<{ name: string; status: DocumentState; uploadedAt: string }>;
  inspection: { at: string; score: number; breakdown: Array<{ label: string; score: number }> };
  rating: number | null;
  joined: string;
}

/** An individual rider's own rates: per-km base plus modifiers, Buzz adds its % */
export interface RiderRates {
  accountId: string;
  perKm: number;
  buzzPercent: number;
  /** Percent added on top of the base, e.g. { fragile: 10 } */
  modifiers: Record<string, number>;
  agreedAt: string;
}

/** One delivery's pay. Individual riders are paid straight after each delivery. */
export interface RiderPayout {
  accountId: string;
  trackingId: string;
  deliveredAt: string;
  distanceKm: number;
  earnings: number;
  buzzShare: number;
  /** held while a dispute on the order is open */
  status: "paid" | "held";
  paidAt: string | null;
}

export type ApplicationStage =
  | "new"
  | "documents_received"
  | "meeting_booked"
  | "inspection"
  | "approved"
  | "rejected";

export type DocumentState = "missing" | "uploaded" | "approved" | "rejected";

export interface Application {
  id: string;
  company: string;
  stage: ApplicationStage;
  cac: string;
  services: ServiceType[];
  states: string[];
  countries?: string[];
  submittedAt: string;
  documents: Record<"partnerAgreement" | "dataProtection" | "riderDeclaration", DocumentState>;
  meeting: { at: string; timezone: string; link: string } | null;
  inspectionScore: number | null;
  companyCodeIssued?: string;
  rejectionReason?: string;
}

export interface Payout {
  partnerId: string;
  date: string;
  deliveries: number;
  partnerEarnings: number;
  partnerPaid: string;
  buzzShare: number;
  buzzSettlement: string;
  buzzSettled: boolean;
}

export type AdminRole = "super_admin" | "partner_manager" | "support" | "finance";

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
}

export interface AuditEntry {
  at: string;
  admin: string;
  action: string;
}

/* ---------- Buzz Web ---------- */

export type MessageStatus = "sent" | "delivered" | "read";

export interface ChatMessage {
  /** "me", "them" (direct chats) or the sender's name (groups) */
  from: string;
  text: string;
  at: string;
  status?: MessageStatus;
  kind?: "voice" | "sticker" | "order" | "booking";
  duration?: string;
  trackingId?: string;
  orderId?: string;
  item?: string;
  orderStatus?: ParcelStatus;
  when?: string;
}

export interface Chat {
  id: string;
  type: "direct" | "group";
  name: string;
  buzzId?: string;
  members?: number;
  unread: number;
  pinned?: boolean;
  pro?: boolean;
  muted?: boolean;
  messages: ChatMessage[];
}

export interface WebUser {
  name: string;
  buzzId: string;
  avatar: string | null;
}

export interface WebNotification {
  id: string;
  priority: boolean;
  kind: "delivery" | string;
  title: string;
  body: string;
  trackingId?: string;
  at: string;
  read: boolean;
}

export type WebUpdate =
  | {
      id: string;
      kind: "security";
      verified: boolean;
      source: string;
      text: string;
      area: string;
      at: string;
    }
  | { id: string; kind: "status"; name: string; text: string; at: string };

/* ---------- Partner portal ---------- */

/**
 * Two sign-in levels for now. A super admin runs the company account (team,
 * reactivations, activity log); a manager runs the day (riders, stops).
 * DESIGN.md §10.2 lists owner/dispatcher/finance/viewer for later.
 */
export type PortalRole = "super_admin" | "manager";

export interface PortalStaff {
  id: string;
  partnerId: string;
  name: string;
  email: string;
  role: PortalRole;
  status: "active" | "invited" | "removed";
  addedAt: string;
  lastSignInAt: string | null;
  removedAt?: string;
}

/** The two kinds of account that sign in on the website (PRODUCT.md logistics rules) */
export type AccountType = "company" | "individual";

/**
 * Sign-in accounts that aren't approved company staff: companies still in
 * review (linked to their application) and individual riders. Pending
 * accounts only reach the review status page.
 */
export interface PortalAccount {
  id: string;
  accountType: AccountType;
  name: string;
  email: string;
  /** Company accounts: the company name from the application */
  company: string | null;
  applicationId: string | null;
  status: "active" | "pending_review";
  /** Individual riders: issued once the inspection passes */
  riderCode: string | null;
  /** Individual riders can also sign in with their Buzz ID, confirmed in the app */
  buzzId: string | null;
  createdAt: string;
  /** Pending accounts: where they are in review (DESIGN.md §10.1 review status) */
  review?: AccountReview;
}

export interface AccountReview {
  receivedAt: string;
  documents: "received" | "checked";
  documentsCheckedAt: string | null;
  inspection: { at: string; place: string } | null;
  /** Out of 100, once the inspection has passed */
  score: number | null;
}

/**
 * Riders and pending accounts (everyone who isn't approved company staff).
 * Carried in its own cookie, separate from the partner portal session.
 * - applicant: staff of a company still in review
 * - individual: an individual rider (pending until the inspection passes)
 * - company_rider: a rider registered by a partner company
 */
export type AccountKind = "applicant" | "individual" | "company_rider";

export interface AccountSession {
  kind: AccountKind;
  /** PortalAccount id (applicant, individual) or Rider id (company_rider) */
  id: string;
  name: string;
  status: "active" | "pending_review";
  signedInAt: string;
  expiresAt: string;
}

/** Who is signed in. This is what the session cookie carries. */
export interface PortalSession {
  staffId: string;
  partnerId: string;
  name: string;
  email: string;
  role: PortalRole;
  signedInAt: string;
  expiresAt: string;
}

export interface RiderDay {
  date: string;
  delivered: number;
  failed: number;
  onTime: number;
  scans: number;
  km: number;
  hoursOnline: number;
}

export type StopKind = "hub" | "pickup" | "drop";
export type StopStatus = "done" | "failed" | "current" | "upcoming";

export interface Stop {
  id: string;
  riderId: string;
  seq: number;
  kind: StopKind;
  /** Area or hub name. Never a street address: partners see only what delivery needs. */
  place: string;
  city: string;
  trackingId: string | null;
  /** Receiver's display name on drops (PRODUCT.md: name, preferred contact, question) */
  receiverName: string | null;
  status: StopStatus;
  plannedAt: string;
  doneAt: string | null;
  note: string | null;
}

export type PortalAction =
  | "signed_in"
  | "signed_out"
  | "rider_registered"
  | "rider_verified"
  | "rider_deactivated"
  | "rider_reactivated"
  | "team_invited"
  | "team_removed"
  | "rider_assigned"
  | "label_printed"
  | "flag_reviewed"
  | "dispute_responded";

export interface PortalActivity {
  id: string;
  at: string;
  partnerId: string;
  actorId: string;
  action: PortalAction;
  summary: string;
  riderId?: string;
}

export interface RiderStats {
  riderId: string;
  days: number;
  delivered: number;
  failed: number;
  /** delivered / (delivered + failed), 0–1, null with no attempts */
  successRate: number | null;
  /** onTime / delivered, 0–1 */
  onTimeRate: number | null;
  scans: number;
  km: number;
  avgPerDay: number;
}
