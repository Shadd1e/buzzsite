/**
 * The only file that touches the fixtures. Everything else goes through the
 * async functions in ./logistics and ./web, so a real backend can replace this
 * file without any UI changes. Never import test-data from a component.
 */
import adminAuditLog from "@test-data/logistics/admin-audit-log.json";
import adminUsers from "@test-data/logistics/admin-users.json";
import applications from "@test-data/logistics/applications.json";
import batches from "@test-data/logistics/batches.json";
import disputes from "@test-data/logistics/disputes.json";
import flags from "@test-data/logistics/flags.json";
import hubs from "@test-data/logistics/hubs.json";
import parcels from "@test-data/logistics/parcels.json";
import partners from "@test-data/logistics/partners.json";
import payouts from "@test-data/logistics/payouts.json";
import riders from "@test-data/logistics/riders.json";
import chats from "@test-data/web/chats.json";

import type {
  AdminUser,
  Application,
  AuditEntry,
  Batch,
  Chat,
  Dispute,
  Flag,
  Hub,
  Parcel,
  Partner,
  Payout,
  Rider,
  WebNotification,
  WebUpdate,
  WebUser,
} from "./types";

// JSON imports are typed loosely (string literals widen to string), so they
// are cast to the contract types once, here.
export const db = {
  parcels: parcels.items as unknown as Parcel[],
  partners: partners.items as unknown as Partner[],
  riders: riders.items as unknown as Rider[],
  hubs: hubs.items as unknown as Hub[],
  batches: batches.items as unknown as Batch[],
  disputes: disputes.items as unknown as Dispute[],
  flags: flags.items as unknown as Flag[],
  applications: applications.items as unknown as Application[],
  payouts: payouts.items as unknown as Payout[],
  adminUsers: adminUsers.items as unknown as AdminUser[],
  auditLog: adminAuditLog.items as unknown as AuditEntry[],
  web: {
    me: chats.me as unknown as WebUser,
    chats: chats.chats as unknown as Chat[],
    notifications: chats.notifications as unknown as WebNotification[],
    updates: chats.updates as unknown as WebUpdate[],
  },
} as const;

/**
 * Every response is a fresh copy, so a page that mutates its data (optimistic
 * UI, sorting in place) can never change what the next caller receives.
 */
export function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Simulated network latency for loading states. Off by default. */
const LATENCY_MS = Number(process.env.NEXT_PUBLIC_MOCK_LATENCY_MS ?? 0);

export async function respond<T>(value: T): Promise<T> {
  if (LATENCY_MS > 0) await new Promise((r) => setTimeout(r, LATENCY_MS));
  return clone(value);
}
