/**
 * Partner portal access rules and the session cookie format. No fixture
 * imports, so the proxy, client components and the data layer can all use it.
 *
 * IMPORTANT: this is a front-end mock. The cookie is not signed, so anyone can
 * edit it. The real auth service must issue an httpOnly, signed session and
 * every API call must check the role on the server. The data layer mirrors
 * that by checking permissions on every call, so the UI is built against the
 * same rules the backend will enforce.
 */
import type { AccountSession, PortalRole, PortalSession } from "@/lib/data/types";

export const SESSION_COOKIE = "buzz_portal_session";
export const SESSION_PATH = "/logistics/portal";
/** Signed out after this long without activity */
export const SESSION_IDLE_MINUTES = 30;
/** Wrong passwords before the account locks */
export const MAX_PASSWORD_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
/** Wrong 2FA codes before the user has to start again */
export const MAX_CODE_ATTEMPTS = 3;

export const PERMISSIONS = {
  view_overview: ["super_admin", "manager"],
  view_stops: ["super_admin", "manager"],
  view_riders: ["super_admin", "manager"],
  register_rider: ["super_admin", "manager"],
  verify_rider: ["super_admin", "manager"],
  deactivate_rider: ["super_admin", "manager"],
  reactivate_rider: ["super_admin"],
  edit_checklist: ["super_admin"],
  manage_team: ["super_admin"],
  view_activity: ["super_admin"],
  // Day-to-day operations: both levels
  view_parcels: ["super_admin", "manager"],
  assign_rider: ["super_admin", "manager"],
  print_label: ["super_admin", "manager"],
  view_batches: ["super_admin", "manager"],
  view_hubs: ["super_admin", "manager"],
  view_rates: ["super_admin", "manager"],
  view_disputes: ["super_admin", "manager"],
  respond_dispute: ["super_admin", "manager"],
  view_flags: ["super_admin", "manager"],
  review_flag: ["super_admin", "manager"],
  view_company: ["super_admin", "manager"],
  // Money: super admins only
  view_payouts: ["super_admin"],
} as const satisfies Record<string, readonly PortalRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: PortalRole | undefined | null, permission: Permission): boolean {
  return !!role && (PERMISSIONS[permission] as readonly PortalRole[]).includes(role);
}

export const ROLE_LABEL: Record<PortalRole, string> = {
  super_admin: "Super admin",
  manager: "Manager",
};

/** Plain-words summary of each level, shown on the Team screen */
export const ROLE_SUMMARY: Record<PortalRole, string> = {
  super_admin:
    "Everything a manager can do, plus payouts and statements, inviting and removing managers, reactivating riders, editing the verification checklist and reading the activity log.",
  manager:
    "Runs the day: parcels and labels, batches, today's stops, rider performance, registering riders, completing verification, deactivating riders, flags and disputes.",
};

/** Which screens need which permission. The proxy and the shell both read this. */
export const ROUTE_PERMISSIONS: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/logistics/portal/team", permission: "manage_team" },
  { prefix: "/logistics/portal/riders/new", permission: "register_rider" },
  { prefix: "/logistics/portal/riders", permission: "view_riders" },
  { prefix: "/logistics/portal/stops", permission: "view_stops" },
  { prefix: "/logistics/portal/parcels", permission: "view_parcels" },
  { prefix: "/logistics/portal/label", permission: "print_label" },
  { prefix: "/logistics/portal/batches", permission: "view_batches" },
  { prefix: "/logistics/portal/hubs", permission: "view_hubs" },
  { prefix: "/logistics/portal/rates", permission: "view_rates" },
  { prefix: "/logistics/portal/payouts", permission: "view_payouts" },
  { prefix: "/logistics/portal/disputes", permission: "view_disputes" },
  { prefix: "/logistics/portal/flags", permission: "view_flags" },
  { prefix: "/logistics/portal/company", permission: "view_company" },
  { prefix: "/logistics/portal", permission: "view_overview" },
];

export function permissionForPath(pathname: string): Permission | null {
  return ROUTE_PERMISSIONS.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`))?.permission ?? null;
}

/* ---------- cookie encoding ---------- */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeSession(session: PortalSession): string {
  return toBase64Url(JSON.stringify(session));
}

const ROLES: readonly string[] = ["super_admin", "manager"];

/** Returns null for anything malformed or expired. */
export function decodeSession(value: string | undefined | null, now: number = Date.now()): PortalSession | null {
  if (!value) return null;
  try {
    const s = JSON.parse(fromBase64Url(value)) as Partial<PortalSession>;
    if (
      typeof s.staffId !== "string" ||
      typeof s.partnerId !== "string" ||
      typeof s.name !== "string" ||
      typeof s.email !== "string" ||
      typeof s.role !== "string" ||
      !ROLES.includes(s.role) ||
      typeof s.expiresAt !== "string" ||
      typeof s.signedInAt !== "string"
    ) {
      return null;
    }
    if (Date.parse(s.expiresAt) <= now) return null;
    return s as PortalSession;
  } catch {
    return null;
  }
}

/** A new expiry, SESSION_IDLE_MINUTES from now */
export function nextExpiry(now: number = Date.now()): string {
  return new Date(now + SESSION_IDLE_MINUTES * 60_000).toISOString();
}

/** Only same-portal paths are allowed after sign in (no open redirects). */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || next.includes("\\") || next.includes("//")) return SESSION_PATH;
  if (next !== SESSION_PATH && !next.startsWith(`${SESSION_PATH}/`) && !next.startsWith(`${SESSION_PATH}?`)) return SESSION_PATH;
  if (next.startsWith(`${SESSION_PATH}/login`)) return SESSION_PATH;
  return next;
}

/* ---------- riders and pending accounts ---------- */

/**
 * Everyone who isn't approved company staff gets this cookie instead of the
 * portal one: riders (company and individual) and pending accounts. Path
 * /logistics so both the review page and the rider area can read it.
 */
export const ACCOUNT_COOKIE = "buzz_account_session";
export const ACCOUNT_PATH = "/logistics";
export const LOGIN_PATH = "/logistics/portal/login";
/** Pending accounts (company or individual) see only this page */
export const REVIEW_PATH = "/logistics/portal/review";
/** Rider area (individual and company riders) */
export const RIDER_PATH = "/logistics/rider";

/** Where an account belongs after sign in */
export function accountHome(s: Pick<AccountSession, "status">): string {
  return s.status === "pending_review" ? REVIEW_PATH : RIDER_PATH;
}

export function encodeAccountSession(session: AccountSession): string {
  return toBase64Url(JSON.stringify(session));
}

const KINDS: readonly string[] = ["applicant", "individual", "company_rider"];
const STATUSES: readonly string[] = ["active", "pending_review"];

/** Returns null for anything malformed or expired. */
export function decodeAccountSession(value: string | undefined | null, now: number = Date.now()): AccountSession | null {
  if (!value) return null;
  try {
    const s = JSON.parse(fromBase64Url(value)) as Partial<AccountSession>;
    if (
      typeof s.kind !== "string" ||
      !KINDS.includes(s.kind) ||
      typeof s.id !== "string" ||
      typeof s.name !== "string" ||
      typeof s.status !== "string" ||
      !STATUSES.includes(s.status) ||
      // Company riders and applicants are never the other status
      (s.kind === "company_rider" && s.status !== "active") ||
      (s.kind === "applicant" && s.status !== "pending_review") ||
      typeof s.expiresAt !== "string" ||
      typeof s.signedInAt !== "string"
    ) {
      return null;
    }
    if (Date.parse(s.expiresAt) <= now) return null;
    return s as AccountSession;
  } catch {
    return null;
  }
}
