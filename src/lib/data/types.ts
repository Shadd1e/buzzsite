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
  rating: number;
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
  children: Array<{ trackingId: string; status: ParcelStatus; unlinkedAt: string | null }>;
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
