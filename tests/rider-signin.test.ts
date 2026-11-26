/**
 * Rider sign in on the website: company riders (company code + rider code),
 * individual riders (rider code + password, or Buzz ID confirmed in the app).
 * Seeds: riders.json and the accounts in test-data/logistics/portal.json.
 */
import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  BUZZ_REQUEST_SECONDS,
  companyRiderSignIn,
  confirmBuzzIdSignIn,
  individualRiderSignIn,
  resetPortalStore,
  startBuzzIdSignIn,
  TEST_CREDENTIALS,
} from "@/lib/data/portal";
import { MAX_PASSWORD_ATTEMPTS } from "@/lib/portal-access";

const T0 = Date.parse("2026-11-19T12:00:00Z");
beforeEach(() => resetPortalStore());

describe("company rider sign in", () => {
  test("an active rider signs in with company code and rider code, in any case and spacing", async () => {
    const r = await companyRiderSignIn(" bzl-c-1042 ", "r-qjgf-85", T0);
    assert.equal(r.ok, true);
    if (!r.ok) throw new Error();
    assert.equal(r.rider.kind, "company_rider");
    assert.equal(r.rider.name, "Tunde Bakare");
    assert.equal(r.rider.company, "Swiftline Logistics");
  });

  test("a rider code only works with its own company's code", async () => {
    const r = await companyRiderSignIn("BZL-C-1043", "R-QJGF-85", T0);
    assert.equal(r.ok === false && r.reason, "invalid");
  });

  test("unverified and deactivated riders get their own answers", async () => {
    assert.deepEqual(await companyRiderSignIn("BZL-C-1042", "R-QUFQ-22", T0), { ok: false, reason: "not_verified" });
    assert.deepEqual(await companyRiderSignIn("BZL-C-1042", "R-LZYP-95", T0), { ok: false, reason: "inactive" });
  });

  test("riders of a suspended company can't sign in", async () => {
    assert.deepEqual(await companyRiderSignIn("BZL-C-1047", "R-NV3Z-66", T0), { ok: false, reason: "inactive" });
  });

  test("an individual rider code points to the other option", async () => {
    assert.deepEqual(await companyRiderSignIn("BZL-C-1042", "BZL-I-2087", T0), {
      ok: false,
      reason: "other_kind",
      kind: "individual",
    });
  });

  test("too many wrong tries lock that rider code", async () => {
    for (let i = 0; i < MAX_PASSWORD_ATTEMPTS - 1; i++) await companyRiderSignIn("BZL-C-1043", "R-QJGF-85", T0);
    const locked = await companyRiderSignIn("BZL-C-1043", "R-QJGF-85", T0);
    assert.equal(locked.ok === false && locked.reason, "locked");
    const evenRight = await companyRiderSignIn("BZL-C-1042", "R-QJGF-85", T0 + 1000);
    assert.equal(evenRight.ok === false && evenRight.reason, "locked");
  });
});

describe("individual rider sign in", () => {
  test("rider code and password", async () => {
    const r = await individualRiderSignIn("bzl-i-2087", TEST_CREDENTIALS.password, T0);
    assert.equal(r.ok, true);
    if (!r.ok) throw new Error();
    assert.deepEqual(r.rider, { id: "a2", kind: "individual", name: "Kelechi Nwosu", riderCode: "BZL-I-2087", company: null, status: "active" });
    assert.equal(r.session.kind, "individual");
    assert.equal(r.session.status, "active");
  });

  test("a wrong password counts down to a lock", async () => {
    const r = await individualRiderSignIn("BZL-I-2087", "nope", T0);
    assert.deepEqual(r, { ok: false, reason: "invalid", attemptsLeft: MAX_PASSWORD_ATTEMPTS - 1 });
  });

  test("a company rider code points to the other option", async () => {
    assert.deepEqual(await individualRiderSignIn("R-QJGF-85", "x", T0), { ok: false, reason: "other_kind", kind: "company_rider" });
  });
});

describe("Buzz ID sign in", () => {
  test("the request is confirmed in the app and signs the rider in", async () => {
    const start = await startBuzzIdSignIn("kelechi.rides", T0);
    if (!start.ok) throw new Error();
    const r = await confirmBuzzIdSignIn(start.requestId, T0 + 5000);
    assert.equal(r.ok && r.rider.name, "Kelechi Nwosu");
  });

  test("a pending rider with no rider code yet can sign in with their Buzz ID", async () => {
    const start = await startBuzzIdSignIn("@Aisha.Bello", T0);
    if (!start.ok) throw new Error();
    const r = await confirmBuzzIdSignIn(start.requestId, T0);
    assert.equal(r.ok && r.rider.status, "pending_review");
  });

  test("unknown Buzz IDs get the same start answer, so the page reveals nothing", async () => {
    const start = await startBuzzIdSignIn("@nobody.here", T0);
    assert.equal(start.ok, true);
    if (!start.ok) throw new Error();
    assert.deepEqual(await confirmBuzzIdSignIn(start.requestId, T0), { ok: false, reason: "no_account" });
  });

  test("requests expire and can only be used once", async () => {
    const a = await startBuzzIdSignIn("@kelechi.rides", T0);
    if (!a.ok) throw new Error();
    assert.deepEqual(await confirmBuzzIdSignIn(a.requestId, T0 + BUZZ_REQUEST_SECONDS * 1000 + 1), { ok: false, reason: "expired" });
    const b = await startBuzzIdSignIn("@kelechi.rides", T0);
    if (!b.ok) throw new Error();
    assert.equal((await confirmBuzzIdSignIn(b.requestId, T0)).ok, true);
    assert.deepEqual(await confirmBuzzIdSignIn(b.requestId, T0), { ok: false, reason: "expired" });
  });

  test("badly formed Buzz IDs are caught before sending", async () => {
    assert.deepEqual(await startBuzzIdSignIn("a b", T0), { ok: false, reason: "format" });
  });
});
