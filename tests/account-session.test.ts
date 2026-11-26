/**
 * Riders and pending accounts: every successful sign in returns a session
 * that sends the account to the right place. Approved staff → partner portal;
 * pending company or individual → review status page; active riders → rider
 * area. Seeds: test-data/logistics/portal.json and riders.json.
 */
import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  companyRiderSignIn,
  completeSignIn,
  confirmBuzzIdSignIn,
  getReviewStatus,
  getRiderHome,
  individualRiderSignIn,
  listInspectionSlots,
  listTestAccounts,
  listTestRiders,
  PortalError,
  rescheduleInspection,
  resetPortalStore,
  startBuzzIdSignIn,
  startSignIn,
  TEST_CREDENTIALS,
} from "@/lib/data/portal";
import type { AccountSession } from "@/lib/data/types";
import {
  accountHome,
  decodeAccountSession,
  encodeAccountSession,
  REVIEW_PATH,
  RIDER_PATH,
} from "@/lib/portal-access";

const T0 = Date.parse("2026-11-19T12:00:00Z");
beforeEach(() => resetPortalStore());

async function staffOrAccount(email: string) {
  const s1 = await startSignIn(email, TEST_CREDENTIALS.password, T0, "company");
  if (!s1.ok) throw new Error(`step 1 failed for ${email}`);
  const s2 = await completeSignIn(s1.challenge, TEST_CREDENTIALS.code, T0);
  if (!s2.ok) throw new Error(`step 2 failed for ${email}`);
  return s2;
}

async function pendingRider(): Promise<AccountSession> {
  const start = await startBuzzIdSignIn("@aisha.bello", T0);
  if (!start.ok) throw new Error();
  const r = await confirmBuzzIdSignIn(start.requestId, T0);
  if (!r.ok) throw new Error();
  return r.session;
}

describe("where each sign in lands", () => {
  test("approved company staff get a portal session, not an account session", async () => {
    const r = await staffOrAccount("ops@swiftline.test");
    assert.ok(r.session);
  });

  test("staff of a company in review get an applicant session for the review page", async () => {
    const r = await staffOrAccount("ops@greenline.test");
    assert.equal(r.session, null);
    if (r.session !== null) throw new Error();
    assert.equal(r.accountSession.kind, "applicant");
    assert.equal(accountHome(r.accountSession), REVIEW_PATH);
  });

  test("active riders go to the rider area, pending riders to the review page", async () => {
    const company = await companyRiderSignIn("BZL-C-1042", "R-QJGF-85", T0);
    const individual = await individualRiderSignIn("BZL-I-2087", TEST_CREDENTIALS.password, T0);
    if (!company.ok || !individual.ok) throw new Error();
    assert.equal(accountHome(company.session), RIDER_PATH);
    assert.equal(accountHome(individual.session), RIDER_PATH);
    assert.equal(accountHome(await pendingRider()), REVIEW_PATH);
  });
});

describe("account cookie", () => {
  test("round-trips, and rejects tampered or expired values", async () => {
    const s = await pendingRider();
    assert.deepEqual(decodeAccountSession(encodeAccountSession(s), T0), s);
    assert.equal(decodeAccountSession(encodeAccountSession(s), Date.parse(s.expiresAt) + 1), null);
    assert.equal(decodeAccountSession("not-a-cookie", T0), null);
    // A company rider can't claim to be pending, nor an applicant active
    assert.equal(decodeAccountSession(encodeAccountSession({ ...s, kind: "company_rider", status: "pending_review" }), T0), null);
    assert.equal(decodeAccountSession(encodeAccountSession({ ...s, kind: "applicant", status: "active" }), T0), null);
  });
});

describe("review status", () => {
  test("a pending company sees its documents checked and its inspection booked", async () => {
    const r = await staffOrAccount("ops@greenline.test");
    if (r.session !== null) throw new Error();
    const status = await getReviewStatus(r.accountSession);
    assert.equal(status.kind, "company");
    assert.equal(status.company, "Greenline Dispatch");
    assert.equal(status.review.documents, "checked");
    assert.ok(status.review.inspection);
  });

  test("an inspection can move to an offered slot, and only an offered slot", async () => {
    const s = await pendingRider();
    const slots = await listInspectionSlots(s);
    assert.equal(slots.length, 10);
    const moved = await rescheduleInspection(s, slots[3]);
    assert.equal(moved.inspection?.at, slots[3]);
    assert.equal((await getReviewStatus(s)).review.inspection?.at, slots[3]);
    await assert.rejects(rescheduleInspection(s, "2026-12-25T03:00:00+01:00"), (e) => e instanceof PortalError && e.code === "invalid");
  });

  test("active riders have no review status", async () => {
    const r = await individualRiderSignIn("BZL-I-2087", TEST_CREDENTIALS.password, T0);
    if (!r.ok) throw new Error();
    await assert.rejects(getReviewStatus(r.session), (e) => e instanceof PortalError && e.code === "forbidden");
  });
});

describe("rider area", () => {
  test("knows who signed in, for both kinds of rider", async () => {
    const c = await companyRiderSignIn("BZL-C-1042", "R-QJGF-85", T0);
    if (!c.ok) throw new Error();
    assert.deepEqual(await getRiderHome(c.session), {
      kind: "company_rider",
      name: "Tunde Bakare",
      riderCode: "R-QJGF-85",
      company: "Swiftline Logistics",
    });
    const i = await individualRiderSignIn("BZL-I-2087", TEST_CREDENTIALS.password, T0);
    if (!i.ok) throw new Error();
    assert.equal((await getRiderHome(i.session)).riderCode, "BZL-I-2087");
  });

  test("pending accounts can't open it", async () => {
    await assert.rejects(getRiderHome(await pendingRider()), (e) => e instanceof PortalError && e.code === "forbidden");
  });
});

describe("test account lists", () => {
  test("say where each account lands, matching the real sign-in", () => {
    const byEmail = Object.fromEntries(listTestAccounts().map((a) => [a.email, a.landsOn]));
    assert.equal(byEmail["ops@swiftline.test"], "Partner portal");
    assert.equal(byEmail["ops@greenline.test"], "Review status page");
    assert.match(byEmail["grace.akpan@swiftline.test"], /^Can't sign in/);
    assert.match(byEmail["femi.ojo@swiftline.test"], /^Can't sign in/);

    const byName = Object.fromEntries(listTestRiders().map((r) => [r.name, r.landsOn]));
    assert.equal(byName["Tunde Bakare"], "Rider area");
    assert.equal(byName["Kelechi Nwosu"], "Rider area");
    assert.match(byName["Aisha Bello"], /^Review status page/);
    assert.match(byName["Kelechi Nnaji"], /^Can't sign in/);
    assert.match(byName["Yusuf Lawal"], /^Can't sign in/);
  });
});
