/**
 * The two portal levels (super admin, manager), company isolation, and the
 * route rules the proxy applies.
 */
import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  addVerificationCheck,
  completeSignIn,
  getCompanyRider,
  getFleetStats,
  getRiderActivity,
  inviteManager,
  listActivity,
  listCompanyRiders,
  listStops,
  listTeam,
  PortalError,
  reactivateRider,
  removeTeamMember,
  resetPortalStore,
  startSignIn,
  TEST_CREDENTIALS,
  deactivateRider,
} from "@/lib/data/portal";
import { can, PERMISSIONS, permissionForPath, type Permission } from "@/lib/portal-access";
import type { PortalSession } from "@/lib/data/types";

async function signIn(email: string): Promise<PortalSession> {
  const a = await startSignIn(email, TEST_CREDENTIALS.password);
  if (!a.ok) throw new Error(`sign in failed: ${email}`);
  const b = await completeSignIn(a.challenge, TEST_CREDENTIALS.code);
  if (!b.ok || !b.session) throw new Error(`2FA failed: ${email}`);
  return b.session;
}

async function rejects(p: Promise<unknown>, code: PortalError["code"]) {
  await assert.rejects(p, (e: unknown) => e instanceof PortalError && e.code === code);
}

let superAdmin: PortalSession;
let manager: PortalSession;
let otherCompany: PortalSession;

beforeEach(async () => {
  resetPortalStore();
  superAdmin = await signIn("ops@swiftline.test");
  manager = await signIn("chiamaka.obi@swiftline.test");
  otherCompany = await signIn("admin@kwikhaul.test");
});

describe("permission matrix", () => {
  const managerCan: Permission[] = [
    "view_overview",
    "view_stops",
    "view_riders",
    "register_rider",
    "verify_rider",
    "deactivate_rider",
  ];
  const superOnly: Permission[] = ["reactivate_rider", "edit_checklist", "manage_team", "view_activity"];

  test("super admin can do everything", () => {
    for (const p of Object.keys(PERMISSIONS) as Permission[]) assert.ok(can("super_admin", p), p);
  });

  test("manager runs the day", () => {
    for (const p of managerCan) assert.ok(can("manager", p), p);
  });

  test("manager can't manage the team, reactivate, edit the checklist or read the log", () => {
    for (const p of superOnly) assert.equal(can("manager", p), false, p);
  });

  test("no role, no access", () => {
    assert.equal(can(null, "view_overview"), false);
    assert.equal(can(undefined, "view_riders"), false);
  });
});

describe("routes", () => {
  test("each screen maps to the right permission", () => {
    assert.equal(permissionForPath("/logistics/portal"), "view_overview");
    assert.equal(permissionForPath("/logistics/portal/stops"), "view_stops");
    assert.equal(permissionForPath("/logistics/portal/riders"), "view_riders");
    assert.equal(permissionForPath("/logistics/portal/riders/r1"), "view_riders");
    assert.equal(permissionForPath("/logistics/portal/riders/new"), "register_rider");
    assert.equal(permissionForPath("/logistics/portal/team"), "manage_team");
  });

  test("a manager is kept out of the team screen", () => {
    assert.equal(can("manager", permissionForPath("/logistics/portal/team")!), false);
  });

  test("lookalike paths don't borrow a looser rule", () => {
    assert.equal(permissionForPath("/logistics/portal/teamwork"), "view_overview");
  });
});

describe("data layer enforces roles (not just the UI)", () => {
  test("manager is refused super-admin calls", async () => {
    await rejects(listTeam(manager), "forbidden");
    await rejects(listActivity(manager), "forbidden");
    await rejects(inviteManager(manager, { name: "New Person", email: "new@swiftline.test" }), "forbidden");
    await rejects(removeTeamMember(manager, "u3"), "forbidden");
    await rejects(addVerificationCheck(manager, "Address visited"), "forbidden");
    await rejects(reactivateRider(manager, "r6"), "forbidden");
  });

  test("a role forged in the session is ignored: the staff record wins", async () => {
    const forged = { ...manager, role: "super_admin" as const };
    await rejects(listTeam(forged), "forbidden");
  });

  test("no session, no data", async () => {
    await rejects(listCompanyRiders(null as unknown as PortalSession), "forbidden");
  });

  test("a removed team member loses access at once", async () => {
    await removeTeamMember(superAdmin, manager.staffId);
    await rejects(listCompanyRiders(manager), "forbidden");
  });
});

describe("company isolation", () => {
  test("each company sees only its own riders", async () => {
    const mine = await listCompanyRiders(superAdmin);
    const theirs = await listCompanyRiders(otherCompany);
    assert.ok(mine.length > 0 && theirs.length > 0);
    assert.ok(mine.every((r) => r.partnerId === "p1"));
    assert.ok(theirs.every((r) => r.partnerId === "p2"));
  });

  test("another company's rider reads as not found, never leaks", async () => {
    assert.equal(await getCompanyRider(superAdmin, "r7"), null); // r7 rides for KwikHaul
    await rejects(getRiderActivity(superAdmin, "r7"), "not_found");
    await rejects(deactivateRider(superAdmin, "r7", "Other"), "not_found");
  });

  test("stops, stats and team are scoped too", async () => {
    const stops = await listStops(manager);
    const ids = new Set((await listCompanyRiders(manager)).map((r) => r.id));
    assert.ok(stops.length > 0);
    assert.ok(stops.every((s) => ids.has(s.riderId)));

    const fleet = await getFleetStats(manager);
    assert.ok(fleet.riders.every((r) => ids.has(r.riderId)));

    const team = await listTeam(superAdmin);
    assert.ok(team.every((m) => m.partnerId === "p1"));
  });

  test("a super admin can't remove another company's staff", async () => {
    await rejects(removeTeamMember(superAdmin, "u7"), "not_found");
  });
});

describe("team rules", () => {
  test("super admin invites a manager, who appears as invited", async () => {
    const m = await inviteManager(superAdmin, { name: "Ada Nwankwo", email: "Ada.Nwankwo@swiftline.test" });
    assert.equal(m.role, "manager");
    assert.equal(m.status, "invited");
    assert.equal(m.email, "ada.nwankwo@swiftline.test");
    assert.ok((await listTeam(superAdmin)).some((x) => x.id === m.id));
  });

  test("invite checks name, email format and duplicates", async () => {
    await assert.rejects(
      inviteManager(superAdmin, { name: "A", email: "not-an-email" }),
      (e: unknown) => e instanceof PortalError && !!e.fields?.name && !!e.fields?.email,
    );
    await assert.rejects(
      inviteManager(superAdmin, { name: "Someone Else", email: "chiamaka.obi@swiftline.test" }),
      (e: unknown) => e instanceof PortalError && !!e.fields?.email,
    );
  });

  test("you can't remove yourself or a super admin", async () => {
    await rejects(removeTeamMember(superAdmin, superAdmin.staffId), "conflict");
  });

  test("team changes land in the activity log with who did them", async () => {
    await inviteManager(superAdmin, { name: "Ada Nwankwo", email: "ada@swiftline.test" });
    await removeTeamMember(superAdmin, "u3");
    const log = await listActivity(superAdmin);
    assert.match(log[0].summary, /Removed Ifeanyi Uzor/);
    assert.match(log[1].summary, /Invited Ada Nwankwo/);
    assert.equal(log[0].actorName, "Babatunde Adeyemi");
    assert.ok(log.every((e) => e.partnerId === "p1"));
  });
});
