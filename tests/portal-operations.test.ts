/**
 * Partner portal operations (DESIGN.md §10.2): parcels, labels, batches, hubs,
 * rates, payouts, disputes, flags, company. Every call is scoped to the
 * signed-in company and checks the role. Seeds: test-data/logistics/*.json.
 */
import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  assignParcelRider,
  completeSignIn,
  getCompanyParcel,
  getCompanyProfile,
  getCompanyRates,
  getLabelForOrder,
  listCompanyBatches,
  listCompanyDisputes,
  listCompanyParcels,
  listCompanyPayouts,
  listPortalFlags,
  listPortalHubs,
  PortalError,
  recordLabelPrinted,
  resetPortalStore,
  respondToCompanyDispute,
  reviewFlag,
  startSignIn,
  TEST_CREDENTIALS,
} from "@/lib/data/portal";
import type { PortalSession } from "@/lib/data/types";

const T0 = Date.parse("2026-11-19T12:00:00Z");
beforeEach(() => resetPortalStore());

async function as(email: string): Promise<PortalSession> {
  const s1 = await startSignIn(email, TEST_CREDENTIALS.password, T0);
  if (!s1.ok) throw new Error(`sign in failed for ${email}`);
  const s2 = await completeSignIn(s1.challenge, TEST_CREDENTIALS.code, T0);
  if (!s2.ok || !s2.session) throw new Error(`2FA failed for ${email}`);
  return s2.session;
}
const swiftAdmin = () => as("ops@swiftline.test");
const swiftManager = () => as("chiamaka.obi@swiftline.test");
const kwikAdmin = () => as("admin@kwikhaul.test");
const code = (c: string) => (e: unknown) => e instanceof PortalError && e.code === c;

describe("parcels", () => {
  test("only this company's parcels, with filters and search by any code", async () => {
    const s = await swiftManager();
    const all = await listCompanyParcels(s);
    assert.ok(all.length > 0 && all.every((p) => p.partnerId === "p1"));
    const booked = await listCompanyParcels(s, { filter: "booked" });
    assert.ok(booked.every((p) => p.status === "booked"));
    const one = all[0];
    assert.deepEqual((await listCompanyParcels(s, { search: one.orderId.toLowerCase() })).map((p) => p.trackingId), [one.trackingId]);
    // Another company can't see it
    assert.equal(await getCompanyParcel(await kwikAdmin(), one.trackingId), null);
  });

  test("a parcel can move to another active rider, not a deactivated one, and not once it's finished", async () => {
    const s = await swiftManager();
    const open = (await listCompanyParcels(s, { filter: "moving" }))[0];
    const moved = await assignParcelRider(s, open.trackingId, "r2");
    assert.equal(moved.riderId, "r2");
    assert.equal((await getCompanyParcel(s, open.trackingId))?.riderId, "r2");
    await assert.rejects(assignParcelRider(s, open.trackingId, "r6"), code("invalid")); // deactivated
    await assert.rejects(assignParcelRider(s, open.trackingId, "r7"), code("not_found")); // KwikHaul's rider
    const done = (await listCompanyParcels(s, { filter: "delivered" }))[0];
    if (done) await assert.rejects(assignParcelRider(s, done.trackingId, "r2"), code("conflict"));
  });
});

describe("labels", () => {
  test("a Depot order ID gives its label; bad or foreign IDs explain what's wrong", async () => {
    const s = await swiftManager();
    const p = (await listCompanyParcels(s))[0];
    const label = await getLabelForOrder(s, ` ${p.orderId.toLowerCase()} `);
    assert.equal(label.trackingId, p.trackingId);
    assert.equal(label.destination, p.route[p.route.length - 1]);
    assert.equal(label.companyCode, "BZL-C-1042");
    await assert.rejects(getLabelForOrder(s, "12345"), code("invalid"));
    await assert.rejects(getLabelForOrder(await kwikAdmin(), p.orderId), code("not_found"));
    await recordLabelPrinted(s, p.trackingId, T0);
    assert.ok((await getCompanyParcel(s, p.trackingId))?.labelPrintedAt);
  });
});

describe("batches, hubs, rates, company", () => {
  test("are scoped to the company", async () => {
    const s = await swiftManager();
    const batches = await listCompanyBatches(s);
    assert.ok(batches.length > 0 && batches.every((b) => b.partnerId === "p1" && b.riderName));
    assert.ok(batches.every((b) => Array.isArray(b.history)));
    assert.ok((await listPortalHubs(s)).every((h) => h.partnerId === "p1"));
    const rates = await getCompanyRates(s);
    assert.equal(rates.perKm, 180);
    const profile = await getCompanyProfile(s);
    assert.equal(profile.partner.companyCode, "BZL-C-1042");
    assert.equal(profile.record.inspection.score, profile.partner.inspectionScore);
  });
});

describe("payouts", () => {
  test("super admins see payouts and statements; managers can't", async () => {
    const pay = await listCompanyPayouts(await swiftAdmin());
    assert.ok(pay.days.length > 0);
    assert.ok(pay.months.length > 0);
    assert.equal(pay.months.reduce((n, m) => n + m.deliveries, 0), pay.days.reduce((n, d) => n + d.deliveries, 0));
    await assert.rejects(listCompanyPayouts(await swiftManager()), code("forbidden"));
  });
});

describe("disputes and flags", () => {
  test("a company answers its own open disputes", async () => {
    const s = await swiftManager();
    const cases = await listCompanyDisputes(s);
    assert.ok(cases.every((d) => d.partnerId === "p1"));
    const open = cases.find((d) => d.status !== "resolved");
    assert.ok(open, "Swiftline has an open dispute in the seed");
    await assert.rejects(respondToCompanyDispute(s, open.id, "short", T0), code("invalid"));
    const d = await respondToCompanyDispute(s, open.id, "Our rider handed it over sealed and the code was verified.", T0);
    assert.ok(d.response);
    await assert.rejects(respondToCompanyDispute(await kwikAdmin(), open.id, "Not our case at all, honestly.", T0), code("not_found"));
    // A decided case can't be answered
    const k = await kwikAdmin();
    const decided = (await listCompanyDisputes(k)).find((x) => x.status === "resolved")!;
    await assert.rejects(respondToCompanyDispute(k, decided.id, "Trying to answer a decided case.", T0), code("conflict"));
  });

  test("flags are reviewed once, with a note", async () => {
    const s = await kwikAdmin();
    const flags = await listPortalFlags(s);
    assert.ok(flags.every((f) => f.partnerId === "p2"));
    const open = flags.find((f) => f.status === "open")!;
    await assert.rejects(reviewFlag(s, open.id, "ok", T0), code("invalid"));
    const done = await reviewFlag(s, open.id, "Rider took a detour around a closed road.", T0);
    assert.equal(done.status, "reviewed");
    await assert.rejects(reviewFlag(s, open.id, "Second review attempt here.", T0), code("conflict"));
  });
});
