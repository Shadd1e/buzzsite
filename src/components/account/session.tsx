"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AccountSession } from "@/lib/data/types";
import {
  ACCOUNT_COOKIE,
  ACCOUNT_PATH,
  decodeAccountSession,
  encodeAccountSession,
  LOGIN_PATH,
  nextExpiry,
  SESSION_IDLE_MINUTES,
} from "@/lib/portal-access";
import { usePortalPersistence } from "@/components/portal/session";

/* ---------- cookie (client) ---------- */

function readCookie(): string | null {
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${ACCOUNT_COOKIE}=`));
  return hit ? hit.slice(ACCOUNT_COOKIE.length + 1) : null;
}

/** Riders and pending accounts. Front-end mock: the real one is httpOnly and signed. */
export function writeAccountCookie(session: AccountSession) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCOUNT_COOKIE}=${encodeAccountSession(session)}; Path=${ACCOUNT_PATH}; Max-Age=${SESSION_IDLE_MINUTES * 60}; SameSite=Strict${secure}`;
}

function clearAccountCookie() {
  document.cookie = `${ACCOUNT_COOKIE}=; Path=${ACCOUNT_PATH}; Max-Age=0; SameSite=Strict`;
}

/* ---------- context ---------- */

interface AccountContext {
  session: AccountSession;
  signOut: (reason?: AccountSignOutReason) => void;
}

/**
 * Why the account left: shown as a note on the sign-in page.
 * account_changed: the account isn't what the cookie says any more (a rider
 * was deactivated, or an account in review was approved), so sign in again.
 */
export type AccountSignOutReason = "account_signed_out" | "account_expired" | "account_changed";

const Ctx = createContext<AccountContext | null>(null);

export function useAccount(): AccountContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccount must be used inside <AccountSessionProvider>");
  return ctx;
}

/**
 * Reads the account cookie after mount, keeps it alive while the person is
 * active and signs them out after SESSION_IDLE_MINUTES idle, like the portal.
 */
export function AccountSessionProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  usePortalPersistence();
  const router = useRouter();
  const [session, setSession] = useState<AccountSession | null>(null);
  const ref = useRef<AccountSession | null>(null);

  const signOut = useCallback(
    (reason: AccountSignOutReason = "account_signed_out") => {
      ref.current = null;
      clearAccountCookie();
      router.replace(`${LOGIN_PATH}?reason=${reason}`);
    },
    [router],
  );

  useEffect(() => {
    const s = decodeAccountSession(readCookie());
    if (!s) {
      signOut("account_expired");
      return;
    }
    ref.current = s;
    // Reading the cookie can only happen in the browser, after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(s);
  }, [signOut]);

  // Idle timeout: activity pushes the expiry back (at most once a minute)
  useEffect(() => {
    if (!session) return;
    let lastBump = Date.now();
    const bump = () => {
      const s = ref.current;
      if (!s || Date.now() - lastBump < 60_000) return;
      lastBump = Date.now();
      const next = { ...s, expiresAt: nextExpiry() };
      ref.current = next;
      writeAccountCookie(next);
    };
    const check = setInterval(() => {
      const s = ref.current;
      if (s && Date.parse(s.expiresAt) <= Date.now()) signOut("account_expired");
    }, 30_000);
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => {
      clearInterval(check);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [session, signOut]);

  if (!session) return <>{fallback}</>;
  return <Ctx.Provider value={{ session, signOut }}>{children}</Ctx.Provider>;
}
