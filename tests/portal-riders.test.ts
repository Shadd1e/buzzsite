/**
 * Registering and deregistering riders, verification, analytics and the
 * privacy formatting the portal tables use.
 */
import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  addVerificationCheck,
  completeSignIn,
  deactivateRider,
  getFleetStats,
  getVerificationChecklist,
  listCompanyRiders,
  listRiderHistory,
  listStops,
  normaliseNigerianPhone,
  PortalError,
  reactivateRider,
  registerRider,
  resetPortalStore,
  RIDER_CODE_PATTERN,
  startSignIn,
  summariseRiderDays,
  TEST_CREDENTIALS,
  verifyRider,
} from "@/lib/data/portal";
import { formatPercent, maskPhone } from "@/lib/data/format";
import type { PortalSession, RiderDay } from "@/lib/data/types";

async function signIn(email: string): Promise<PortalSession> {
  const a = await startSignIn(email, TEST_CREDENTIALS.password);
  if (!a.ok) throw new Error(email);
  const b = await completeSignIn(a.challenge, TEST_CREDENTIALS.code);
  if (!b.ok || !b.session) throw new Error(email);
  return b.session;
}

let superAdmin: PortalSession;
let manager: PortalSession;
let checklist: string[];

beforeEach(async () => {
  resetPortalStore();
  superAdmin = await signIn("ops@swiftline.test");
  manager = await signIn("chiamaka.obi@swiftline.test");
  checklist = await getVerificationChecklist(manager);
});

const allDone = () => checklist.map((label) => ({ label, done: true }));

describe("register a rider", () => {
  test("a manager registers a fully verified rider: active, with a rider code", async () => {
    const r = await registerRider(manager, {
      name: "Chinedu Okafor",
      phone: "0800 000 4321",
      vehicle: "Motorbike",
      checks: allDone(),
      confirmed: true,
    });
    assert.equal(r.status, "active");
    assert.equal(r.partnerId, "p1");
    assert.match(r.riderCode, RIDER_CODE_PATTERN);
    assert.equal(r.phone, "+234 800 000 4321");
    assert.equal(r.verification.confirmedByCompany, true);
    assert.equal(r.appSignedIn, false);
    assert.equal(r.rating, null);
    assert.ok((await listCompanyRiders(manager)).some((x) => x.id === r.id));
  });

  test("without the confirmation box, the rider waits in pending verification", async () => {
    const r = await registerRider(manager, { name: "Chinedu Okafor", phone: "08000004321", vehicle: "Van", checks: allDone(), confirmed: false });
    assert.equal(r.status, "pending_verification");
    assert.equal(r.verification.confirmedByCompany, false);
  });

  test("with a check missing, the rider waits in pending verification", async () => {
    const checks = allDone();
    checks[0].done = false;
    const r = await registerRider(manager, { name: "Chinedu Okafor", phone: "08000004321", vehicle: "Van", checks, confirmed: true });
    assert.equal(r.status, "pending_verification");
  });

  test("checks the company didn't ask for are ignored", async () => {
    const r = await registerRider(manager, {
      name: "Chinedu Okafor",
      phone: "08000004321",
      vehicle: "Car",
      checks: [...allDone(), { label: "Made-up check", done: true }],
      confirmed: true,
    });
    assert.deepEqual(r.verification.companyChecks.map((c) => c.label), checklist);
  });

  test("rider codes are unique", async () => {
    const codes = new Set((await listCompanyRiders(superAdmin)).map((r) => r.riderCode));
    for (let i = 0; i < 30; i++) {
      const r = await registerRider(manager, {
        name: `Test Rider${i}`,
        phone: `0800 000 ${String(5000 + i)}`,
        vehicle: "Bicycle",
        checks: allDone(),
        confirmed: true,
      });
      assert.equal(codes.has(r.riderCode), false);
      codes.add(r.riderCode);
    }
  });

  test("invalid fields come back per field, in plain words", async () => {
    await assert.rejects(
      registerRider(manager, { name: "Tunde", phone: "12345", vehicle: "Helicopter", checks: [], confirmed: true }),
      (e: unknown) =>
        e instanceof PortalError &&
        e.code === "invalid" &&
        /first and last name/.test(e.fields?.name ?? "") &&
        /Nigerian mobile number/.test(e.fields?.phone ?? "") &&
        /vehicle/.test(e.fields?.vehicle ?? ""),
    );
  });

  test("a phone number already used by an active rider in the company is refused", async () => {
    const [existing] = await listCompanyRiders(manager, { status: "active" });
    await assert.rejects(
      registerRider(manager, { name: "Copy Cat", phone: existing.phone, vehicle: "Car", checks: allDone(), confirmed: true }),
      (e: unknown) => e instanceof PortalError && /already uses this number/.test(e.fields?.phone ?? ""),
    );
  });

  test("registration is logged against the person who did it", async () => {
    const r = await registerRider(manager, { name: "Chinedu Okafor", phone: "08000004321", vehicle: "Car", checks: allDone(), confirmed: true });
    const history = await listRiderHistory(superAdmin, r.id);
    assert.equal(history[0].action, "rider_registered");
    assert.equal(history[0].actorName, "Chiamaka Obi");
  });
});

describe("verify a pending rider", () => {
  test("ticking every check and confirming makes them active", async () => {
    const r = await verifyRider(manager, "r5", { checks: allDone(), confirmed: true });
    assert.equal(r.status, "active");
    assert.equal(r.verification.confirmedByCompany, true);
  });

  test("partial progress is saved but they stay pending", async () => {
    const checks = allDone();
    checks[2].done = false;
    await assert.rejects(verifyRider(manager, "r5", { checks, confirmed: true }), (e: unknown) => e instanceof PortalError && e.code === "invalid");
    const [r5] = (await listCompanyRiders(manager)).filter((r) => r.id === "r5");
    assert.equal(r5.status, "pending_verification");
    assert.equal(r5.verification.companyChecks.filter((c) => c.done).length, 2);
  });

  test("an active rider can't be verified again", async () => {
    await assert.rejects(verifyRider(manager, "r1", { checks: allDone(), confirmed: true }), (e: unknown) => e instanceof PortalError && e.code === "conflict");
  });

  test("a super admin can add a company check, and new riders need it", async () => {
    await addVerificationCheck(superAdmin, "Address visited");
    const list = await getVerificationChecklist(manager);
    assert.equal(list.at(-1), "Address visited");
    const r = await registerRider(manager, { name: "New Rider", phone: "08000009999", vehicle: "Car", checks: allDone(), confirmed: true });
    assert.equal(r.status, "pending_verification", "the new check wasn't ticked");
    await assert.rejects(addVerificationCheck(superAdmin, "address VISITED"), (e: unknown) => e instanceof PortalError && e.code === "conflict");
  });
});

describe("deregister (deactivate) and reactivate", () => {
  test("a manager deactivates a rider with a reason; history is kept", async () => {
    const before = await listRiderHistory(manager, "r1");
    const r = await deactivateRider(manager, "r1", "Left the company");
    assert.equal(r.status, "deactivated");
    assert.equal(r.deactivatedReason, "Left the company");
    assert.equal(r.appSignedIn, false, "deactivation signs them out of the app");
    assert.equal(r.riderCode.length > 0, true, "the rider code is kept for the record");
    const after = await listRiderHistory(manager, "r1");
    assert.equal(after.length, before.length + 1);
    assert.match(after[0].summary, /Deactivated rider Tunde Bakare: Left the company/);
  });

  test("a reason is required", async () => {
    await assert.rejects(deactivateRider(manager, "r1", "  "), (e: unknown) => e instanceof PortalError && !!e.fields?.reason);
  });

  test("deactivating twice is refused", async () => {
    await assert.rejects(deactivateRider(manager, "r6", "Other"), (e: unknown) => e instanceof PortalError && e.code === "conflict");
  });

  test("a pending rider can be deactivated too", async () => {
    assert.equal((await deactivateRider(manager, "r5", "Failed verification")).status, "deactivated");
  });

  test("only a super admin reactivates, and the same rider code works again", async () => {
    const code = (await listCompanyRiders(superAdmin)).find((r) => r.id === "r6")!.riderCode;
    const r = await reactivateRider(superAdmin, "r6");
    assert.equal(r.status, "active");
    assert.equal(r.riderCode, code);
    assert.equal(r.deactivatedReason, undefined);
  });

  test("reactivating a never-verified rider puts them back in pending", async () => {
    await deactivateRider(manager, "r5", "Other");
    assert.equal((await reactivateRider(superAdmin, "r5")).status, "pending_verification");
  });

  test("tabs: status filter returns the right riders", async () => {
    await deactivateRider(manager, "r2", "Other");
    const deactivated = await listCompanyRiders(manager, { status: "deactivated" });
    assert.deepEqual(deactivated.map((r) => r.id).sort(), ["r2", "r6"]);
  });

  test("search matches name or rider code, any case", async () => {
    assert.deepEqual((await listCompanyRiders(manager, { search: "tunde" })).map((r) => r.id), ["r1"]);
    assert.deepEqual((await listCompanyRiders(manager, { search: "r-bn4q" })).map((r) => r.id), ["r2"]);
    assert.equal((await listCompanyRiders(manager, { search: "zzz" })).length, 0);
  });
});

describe("analytics", () => {
  const days: RiderDay[] = [
    { date: "2026-11-17", delivered: 8, failed: 2, onTime: 6, scans: 20, km: 60, hoursOnline: 8 },
    { date: "2026-11-18", delivered: 10, failed: 0, onTime: 9, scans: 22, km: 70, hoursOnline: 9 },
    { date: "2026-11-19", delivered: 2, failed: 0, onTime: 2, scans: 5, km: 15, hoursOnline: 3 },
  ];

  test("totals and rates over the window", () => {
    const s = summariseRiderDays("r1", days, 7);
    assert.equal(s.days, 3);
    assert.equal(s.delivered, 20);
    assert.equal(s.failed, 2);
    assert.equal(s.successRate, 20 / 22);
    assert.equal(s.onTimeRate, 17 / 20);
    assert.equal(s.km, 145);
    assert.equal(s.avgPerDay, 20 / 3);
  });

  test("window takes the most recent days", () => {
    const s = summariseRiderDays("r1", days, 2);
    assert.equal(s.delivered, 12);
    assert.equal(s.failed, 0);
    assert.equal(s.successRate, 1);
  });

  test("no attempts gives no rate rather than 0% or NaN", () => {
    const s = summariseRiderDays("new", [], 7);
    assert.equal(s.successRate, null);
    assert.equal(s.onTimeRate, null);
    assert.equal(s.avgPerDay, 0);
    assert.equal(formatPercent(s.successRate), "–");
  });

  test("fleet daily totals add up to the riders' days", async () => {
    const fleet = await getFleetStats(manager, 14);
    const today = fleet.daily.at(-1)!;
    const perRider = fleet.riders.length;
    assert.ok(perRider >= 4);
    assert.equal(fleet.daily.length, 14);
    assert.equal(today.date, "2026-11-19");
    const sum = fleet.riders.reduce((n, r) => n + r.delivered, 0);
    assert.equal(sum, fleet.fleet.delivered);
  });

  test("seed data is believable: rates between 0 and 1, on time never above delivered", async () => {
    const fleet = await getFleetStats(superAdmin, 14);
    for (const r of fleet.riders) {
      assert.ok(r.successRate === null || (r.successRate >= 0 && r.successRate <= 1), r.riderId);
      assert.ok(r.onTimeRate === null || r.onTimeRate <= 1, r.riderId);
    }
  });

  test("today's stops are in order for each rider and at most one is current", async () => {
    const stops = await listStops(manager);
    const byRider = Map.groupBy(stops, (s) => s.riderId);
    for (const [rider, run] of byRider) {
      assert.deepEqual(run.map((s) => s.seq), run.map((_, i) => i + 1), rider);
      assert.ok(run.filter((s) => s.status === "current").length <= 1, rider);
      assert.equal(run[0].kind, "hub", `${rider} starts at a hub`);
    }
  });

  test("stops never carry a street address or a rider's position", async () => {
    const stops = await listStops(superAdmin);
    for (const s of stops) {
      assert.equal(/\d+\s+\w+\s+(Street|Road|Close|Avenue|Way)/i.test(s.place), false, s.place);
      assert.equal("lat" in s || "lng" in s || "location" in s, false);
    }
  });
});

describe("privacy formatting", () => {
  test("phone numbers are masked in tables", () => {
    assert.equal(maskPhone("+234 800 000 7912"), "+234 800 ••• ••12");
    assert.equal(maskPhone("12"), "••••");
  });

  test("Nigerian phone numbers normalise from any common form", () => {
    for (const input of ["08000001234", "0800 000 1234", "+2348000001234", "234-800-000-1234", "(0800) 000 1234"]) {
      assert.equal(normaliseNigerianPhone(input), "+234 800 000 1234", input);
    }
    for (const bad of ["", "1234", "0600 000 1234", "080000012345"]) {
      assert.equal(normaliseNigerianPhone(bad), null, bad);
    }
  });
});
