/**
 * Rider portal (DESIGN.md §10.2, individual rider portal): every call is scoped
 * to the signed-in rider. Individual riders see their own rates, pay and
 * disputes; company riders don't (their company handles those).
 * Seeds: test-data/logistics/rider-portal.json, parcels.json, riders.json.
 */
import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  companyRiderSignIn,
  confirmBuzzIdSignIn,
  deactivateRider,
  individualRiderSignIn,
  PortalError,
  resetPortalStore,
  startBuzzIdSignIn,
  startSignIn,
  completeSignIn,
  TEST_CREDENTIALS,
} from "@/lib/data/portal";
import {
  getMyParcel,
  getRiderOverview,
  getRiderProfile,
  getRiderRates,
  listMyParcels,
  listRiderBatches,
  listRiderDisputes,
  listRiderFlags,
  listRiderPayouts,
  quoteFromRates,
  resetRiderResponses,
  respondToRiderDispute,
} from "@/lib/data/rider";
import type { AccountSession } from "@/lib/data/types";

const T0 = Date.parse("2026-11-19T12:00:00Z");
beforeEach(() => {
  resetPortalStore();
  resetRiderResponses();
});

async function kelechi(): Promise<AccountSession> {
  const r = await individualRiderSignIn("BZL-I-2087", TEST_CREDENTIALS.password, T0);
  if (!r.ok) throw new Error();
  return r.session;
}
async function tunde(): Promise<AccountSession> {
  const r = await companyRiderSignIn("BZL-C-1042", "R-QJGF-85", T0);
  if (!r.ok) throw new Error();
  return r.session;
}
const forbidden = (e: unknown) => e instanceof PortalError && e.code === "forbidden";

describe("individual rider", () => {
  test("overview counts today's work from his own parcels", async () => {
    const o = await getRiderOverview(await kelechi());
    assert.equal(o.kind, "individual");
    assert.equal(o.toCollect, 2);
    assert.equal(o.inTransit, 3);
    assert.equal(o.deliveredToday, 2);
    assert.equal(o.earningsToday, 1440 + 3840);
    assert.equal(o.activeBatch?.id, "MQ-KN7TR");
    assert.ok(o.recentScans.length > 0);
  });

  test("parcels are only his, filter and search work", async () => {
    const s = await kelechi();
    const all = await listMyParcels(s);
    assert.equal(all.length, 12);
    assert.ok(all.every((p) => p.riderId === "a2"));
    assert.equal((await listMyParcels(s, { filter: "to_collect" })).length, 2);
    assert.deepEqual((await listMyParcels(s, { search: "dpt-639744" })).map((p) => p.trackingId), ["BZT-KN9H-6X3V"]);
    // Another rider's parcel is invisible
    assert.equal(await getMyParcel(s, "BZT-EDQE-CXER"), null);
  });

  test("rates, payouts, batches, flags and profile", async () => {
    const s = await kelechi();
    const rates = await getRiderRates(s);
    assert.equal(rates.perKm, 160);
    assert.deepEqual(quoteFromRates(rates, 10, ["fragile"]), { earnings: 1760, buzzShare: 53, buyerPays: 1813 });
    const pay = await listRiderPayouts(s);
    assert.equal(pay.paidToday, 5280);
    assert.ok(pay.held > 0, "the disputed order's pay is held");
    assert.equal((await listRiderBatches(s)).length, 2);
    assert.equal((await listRiderFlags(s))[0].status, "open");
    const profile = await getRiderProfile(s);
    assert.equal(profile.kind, "individual");
    if (profile.kind !== "individual") throw new Error();
    assert.equal(profile.inspection.score, 86);
  });

  test("can answer an open dispute, not a decided one", async () => {
    const s = await kelechi();
    await assert.rejects(respondToRiderDispute(s, "DSP-3112", "too short", T0), (e) => e instanceof PortalError && e.code === "invalid");
    const d = await respondToRiderDispute(s, "DSP-3112", "The box was sealed and whole when the buyer signed for it.", T0);
    assert.ok(d.response);
    assert.ok((await listRiderDisputes(s)).find((x) => x.id === "DSP-3112")?.response);
    await assert.rejects(
      respondToRiderDispute(s, "DSP-3071", "Delivered on the booked day as agreed.", T0),
      (e) => e instanceof PortalError && e.code === "conflict",
    );
  });
});

describe("company rider", () => {
  test("sees only his own parcels and no money screens", async () => {
    const s = await tunde();
    const parcels = await listMyParcels(s);
    assert.ok(parcels.length > 0 && parcels.every((p) => p.riderId === "r1"));
    const o = await getRiderOverview(s);
    assert.equal(o.earningsToday, null);
    await assert.rejects(getRiderRates(s), forbidden);
    await assert.rejects(listRiderPayouts(s), forbidden);
    await assert.rejects(listRiderDisputes(s), forbidden);
    const profile = await getRiderProfile(s);
    assert.equal(profile.kind === "company_rider" && profile.company, "Swiftline Logistics");
    assert.ok(profile.kind === "company_rider" && !/\d{5}/.test(profile.phone.replace(/\s/g, "")), "phone is masked");
  });

  test("loses access as soon as the company deactivates him", async () => {
    const s = await tunde();
    const step1 = await startSignIn("ops@swiftline.test", TEST_CREDENTIALS.password, T0);
    if (!step1.ok) throw new Error();
    const step2 = await completeSignIn(step1.challenge, TEST_CREDENTIALS.code, T0);
    if (!step2.ok || !step2.session) throw new Error();
    await deactivateRider(step2.session, "r1", "Left the company");
    await assert.rejects(listMyParcels(s), forbidden);
  });
});

test("pending accounts can't open the rider portal", async () => {
  const start = await startBuzzIdSignIn("@aisha.bello", T0);
  if (!start.ok) throw new Error();
  const r = await confirmBuzzIdSignIn(start.requestId, T0);
  if (!r.ok) throw new Error();
  await assert.rejects(getRiderOverview(r.session), forbidden);
});
