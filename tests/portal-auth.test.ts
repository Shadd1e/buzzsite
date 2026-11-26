/**
 * Partner portal sign in: password + 2FA, lockout, account states, and the
 * session cookie the proxy reads. Seed accounts come from
 * test-data/logistics/portal.json (password "Buzz-test-2026", code 123456).
 */
import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { completeSignIn, resetPortalStore, startSignIn, TEST_CREDENTIALS } from "@/lib/data/portal";
import {
  decodeSession,
  encodeSession,
  LOCKOUT_MINUTES,
  MAX_CODE_ATTEMPTS,
  MAX_PASSWORD_ATTEMPTS,
  safeNextPath,
} from "@/lib/portal-access";
import type { PortalSession } from "@/lib/data/types";

const { password, code } = TEST_CREDENTIALS;
const T0 = Date.parse("2026-11-19T12:00:00Z");

async function signIn(email: string, now = T0) {
  const step1 = await startSignIn(email, password, now);
  assert.equal(step1.ok, true, `password step failed for ${email}`);
  if (!step1.ok) throw new Error();
  const step2 = await completeSignIn(step1.challenge, code, now);
  assert.equal(step2.ok, true);
  if (!step2.ok || !step2.session) throw new Error();
  return step2.session;
}

beforeEach(() => resetPortalStore());

describe("sign in", () => {
  test("super admin signs in with password then 2FA and gets the super_admin role", async () => {
    const s = await signIn("ops@swiftline.test");
    assert.equal(s.role, "super_admin");
    assert.equal(s.partnerId, "p1");
    assert.equal(s.name, "Babatunde Adeyemi");
  });

  test("manager signs in and gets the manager role", async () => {
    const s = await signIn("chiamaka.obi@swiftline.test");
    assert.equal(s.role, "manager");
    assert.equal(s.partnerId, "p1");
  });

  test("email is matched without case or spaces", async () => {
    const s = await signIn("  OPS@Swiftline.TEST ");
    assert.equal(s.staffId, "u1");
  });

  test("session lasts 30 minutes from sign in", async () => {
    const s = await signIn("ops@swiftline.test");
    assert.equal(Date.parse(s.expiresAt) - T0, 30 * 60_000);
  });

  test("wrong password and unknown email give the same answer", async () => {
    const wrongPw = await startSignIn("ops@swiftline.test", "nope", T0);
    const unknown = await startSignIn("nobody@swiftline.test", password, T0);
    assert.deepEqual(wrongPw, { ok: false, reason: "invalid", attemptsLeft: MAX_PASSWORD_ATTEMPTS - 1 });
    assert.deepEqual(unknown, { ok: false, reason: "invalid", attemptsLeft: MAX_PASSWORD_ATTEMPTS - 1 });
  });

  test(`account locks after ${MAX_PASSWORD_ATTEMPTS} wrong passwords, even for the right password`, async () => {
    for (let i = 1; i < MAX_PASSWORD_ATTEMPTS; i++) {
      const r = await startSignIn("ops@swiftline.test", "wrong", T0);
      assert.equal(r.ok, false);
      if (!r.ok) assert.equal(r.reason, "invalid");
    }
    const locked = await startSignIn("ops@swiftline.test", "wrong", T0);
    assert.equal(locked.ok, false);
    if (!locked.ok) assert.equal(locked.reason, "locked");

    const stillLocked = await startSignIn("ops@swiftline.test", password, T0 + 60_000);
    assert.equal(stillLocked.ok, false);
    if (!stillLocked.ok) assert.equal(stillLocked.reason, "locked");
  });

  test(`lock lifts after ${LOCKOUT_MINUTES} minutes`, async () => {
    for (let i = 0; i < MAX_PASSWORD_ATTEMPTS; i++) await startSignIn("ops@swiftline.test", "wrong", T0);
    const later = T0 + LOCKOUT_MINUTES * 60_000 + 1;
    const r = await startSignIn("ops@swiftline.test", password, later);
    assert.equal(r.ok, true);
  });

  test("a correct password resets the failure count", async () => {
    await startSignIn("ops@swiftline.test", "wrong", T0);
    await startSignIn("ops@swiftline.test", "wrong", T0);
    await startSignIn("ops@swiftline.test", password, T0);
    const r = await startSignIn("ops@swiftline.test", "wrong", T0);
    assert.equal(r.ok, false);
    if (!r.ok && r.reason === "invalid") assert.equal(r.attemptsLeft, MAX_PASSWORD_ATTEMPTS - 1);
  });

  test("removed and invited accounts can't sign in", async () => {
    const removed = await startSignIn("femi.ojo@swiftline.test", password, T0);
    const invited = await startSignIn("grace.akpan@swiftline.test", password, T0);
    assert.deepEqual(removed, { ok: false, reason: "no_access" });
    assert.deepEqual(invited, { ok: false, reason: "no_access" });
  });
});

describe("account types", () => {
  test("an individual rider signs in on the Individual rider tab and gets no portal session yet", async () => {
    const step1 = await startSignIn("kelechi.nwosu@rider.test", password, T0, "individual");
    assert.equal(step1.ok, true);
    if (!step1.ok) throw new Error();
    const step2 = await completeSignIn(step1.challenge, code, T0);
    assert.equal(step2.ok, true);
    if (!step2.ok) throw new Error();
    assert.equal(step2.session, null);
    if (step2.session) throw new Error();
    assert.equal(step2.account.accountType, "individual");
    assert.equal(step2.account.status, "active");
    assert.equal(step2.account.riderCode, "BZL-I-2087");
  });

  test("pending accounts of both types can sign in and are marked pending", async () => {
    for (const [email, type] of [["aisha.bello@rider.test", "individual"], ["ops@greenline.test", "company"]] as const) {
      const step1 = await startSignIn(email, password, T0, type);
      if (!step1.ok) throw new Error(email);
      const step2 = await completeSignIn(step1.challenge, code, T0);
      if (!step2.ok || step2.session) throw new Error(email);
      assert.equal(step2.account.status, "pending_review", email);
    }
  });

  test("the wrong type is only revealed after the right password", async () => {
    assert.deepEqual(await startSignIn("kelechi.nwosu@rider.test", password, T0, "company"), {
      ok: false,
      reason: "wrong_type",
      accountType: "individual",
    });
    assert.deepEqual(await startSignIn("ops@swiftline.test", password, T0, "individual"), {
      ok: false,
      reason: "wrong_type",
      accountType: "company",
    });
    const wrongPw = await startSignIn("kelechi.nwosu@rider.test", "nope", T0, "company");
    assert.equal(wrongPw.ok === false && wrongPw.reason, "invalid");
  });

  test("wrong 2FA code counts down, then the challenge is thrown away", async () => {
    const step1 = await startSignIn("ops@swiftline.test", password, T0);
    assert.ok(step1.ok);
    if (!step1.ok) return;
    for (let i = 1; i < MAX_CODE_ATTEMPTS; i++) {
      const r = await completeSignIn(step1.challenge, "000000", T0);
      assert.deepEqual(r, { ok: false, reason: "wrong_code", attemptsLeft: MAX_CODE_ATTEMPTS - i });
    }
    assert.deepEqual(await completeSignIn(step1.challenge, "000000", T0), { ok: false, reason: "expired" });
    // Even the right code no longer works on that challenge
    assert.deepEqual(await completeSignIn(step1.challenge, code, T0), { ok: false, reason: "expired" });
  });

  test("2FA challenge expires after 5 minutes and can't be reused", async () => {
    const step1 = await startSignIn("ops@swiftline.test", password, T0);
    assert.ok(step1.ok);
    if (!step1.ok) return;
    assert.deepEqual(await completeSignIn(step1.challenge, code, T0 + 5 * 60_000 + 1), { ok: false, reason: "expired" });

    const again = await startSignIn("ops@swiftline.test", password, T0);
    if (!again.ok) return assert.fail();
    assert.equal((await completeSignIn(again.challenge, code, T0)).ok, true);
    assert.deepEqual(await completeSignIn(again.challenge, code, T0), { ok: false, reason: "expired" });
  });

  test("code accepts spaces (\"123 456\")", async () => {
    const step1 = await startSignIn("ops@swiftline.test", password, T0);
    if (!step1.ok) return assert.fail();
    assert.equal((await completeSignIn(step1.challenge, "123 456", T0)).ok, true);
  });
});

describe("session cookie", () => {
  const session: PortalSession = {
    staffId: "u1",
    partnerId: "p1",
    name: "Babatunde Adeyemi",
    email: "ops@swiftline.test",
    role: "super_admin",
    signedInAt: "2026-11-19T12:00:00.000Z",
    expiresAt: "2026-11-19T12:30:00.000Z",
  };

  test("round-trips", () => {
    assert.deepEqual(decodeSession(encodeSession(session), T0), session);
  });

  test("is rejected once expired", () => {
    assert.equal(decodeSession(encodeSession(session), Date.parse(session.expiresAt)), null);
  });

  test("garbage and unknown roles are rejected", () => {
    assert.equal(decodeSession("not-a-session", T0), null);
    assert.equal(decodeSession("", T0), null);
    assert.equal(decodeSession(encodeSession({ ...session, role: "owner" as never }), T0), null);
    assert.equal(decodeSession(encodeSession({ ...session, staffId: 7 as never }), T0), null);
  });

  test("names with non-English letters survive encoding", () => {
    const s = { ...session, name: "Ọlá Adébáyọ̀" };
    assert.equal(decodeSession(encodeSession(s), T0)?.name, "Ọlá Adébáyọ̀");
  });
});

describe("redirect after sign in", () => {
  test("allows portal paths", () => {
    assert.equal(safeNextPath("/logistics/portal/riders/r1"), "/logistics/portal/riders/r1");
    assert.equal(safeNextPath("/logistics/portal?denied=x"), "/logistics/portal?denied=x");
  });

  test("blocks anything outside the portal and open redirects", () => {
    for (const bad of ["https://evil.test", "//evil.test", "/logistics/portalx", "/logistics/portal//evil.test", "/\\evil.test", "/admin", null, undefined]) {
      assert.equal(safeNextPath(bad), "/logistics/portal", String(bad));
    }
  });

  test("never sends a signed-in user back to the sign-in page", () => {
    assert.equal(safeNextPath("/logistics/portal/login"), "/logistics/portal");
  });
});
