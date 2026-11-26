"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type DependencyList,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  configurePortalPersistence,
  getCurrentStaff,
  getPortalCompany,
  PortalError,
  recordSignOut,
} from "@/lib/data";
import type { Partner, PortalSession, PortalStaff } from "@/lib/data/types";
import {
  can,
  decodeSession,
  encodeSession,
  nextExpiry,
  SESSION_COOKIE,
  SESSION_IDLE_MINUTES,
  SESSION_PATH,
  type Permission,
} from "@/lib/portal-access";

/* ---------- cookie (client) ---------- */

function readCookie(): string | null {
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return hit ? hit.slice(SESSION_COOKIE.length + 1) : null;
}

export function writeSessionCookie(session: PortalSession) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=${encodeSession(session)}; Path=${SESSION_PATH}; Max-Age=${SESSION_IDLE_MINUTES * 60}; SameSite=Strict${secure}`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; Path=${SESSION_PATH}; Max-Age=0; SameSite=Strict`;
}

let persistenceReady = false;
/** Connect the mock store to sessionStorage once per tab. */
export function usePortalPersistence() {
  if (typeof window !== "undefined" && !persistenceReady) {
    persistenceReady = true;
    try {
      configurePortalPersistence(window.sessionStorage);
    } catch {
      // Storage blocked: changes last until reload.
    }
  }
}

/* ---------- context ---------- */

interface PortalContext {
  session: PortalSession;
  staff: PortalStaff;
  company: Partner;
  can: (permission: Permission) => boolean;
  signOut: (reason?: "signed_out" | "expired" | "no_access") => void;
}

const Ctx = createContext<PortalContext | null>(null);

export function usePortal(): PortalContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortal must be used inside <PortalSessionProvider>");
  return ctx;
}

/**
 * Reads the session cookie after mount (the server can't see sessionStorage,
 * so nothing session-specific renders on the server), keeps it alive while the
 * person is active and signs them out after SESSION_IDLE_MINUTES idle.
 */
export function PortalSessionProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  usePortalPersistence();
  const router = useRouter();
  const pathname = usePathname();
  const [ctx, setCtx] = useState<Omit<PortalContext, "can" | "signOut"> | null>(null);
  const sessionRef = useRef<PortalSession | null>(null);

  const signOut = useCallback(
    (reason: "signed_out" | "expired" | "no_access" = "signed_out") => {
      const s = sessionRef.current;
      sessionRef.current = null;
      clearSessionCookie();
      if (s && reason === "signed_out") void recordSignOut(s);
      const next = reason === "signed_out" ? "" : `&next=${encodeURIComponent(location.pathname + location.search)}`;
      router.replace(`/logistics/portal/login?reason=${reason}${next}`);
    },
    [router],
  );

  // Load the session, then the staff record and company
  useEffect(() => {
    let live = true;
    const session = decodeSession(readCookie());
    if (!session) {
      signOut("expired");
      return;
    }
    sessionRef.current = session;
    Promise.all([getCurrentStaff(session), getPortalCompany(session)])
      .then(([staff, company]) => {
        if (!live) return;
        // The role on record wins over whatever the cookie says
        const fresh = { ...session, role: staff.role };
        sessionRef.current = fresh;
        setCtx({ session: fresh, staff, company });
      })
      .catch((e) => {
        if (live) signOut(e instanceof PortalError && e.code === "forbidden" ? "no_access" : "expired");
      });
    return () => {
      live = false;
    };
  }, [signOut]);

  // Idle timeout: activity pushes the expiry back (at most once a minute)
  useEffect(() => {
    if (!ctx) return;
    let lastBump = Date.now();
    const bump = () => {
      const s = sessionRef.current;
      if (!s || Date.now() - lastBump < 60_000) return;
      lastBump = Date.now();
      const next = { ...s, expiresAt: nextExpiry() };
      sessionRef.current = next;
      writeSessionCookie(next);
    };
    const check = setInterval(() => {
      const s = sessionRef.current;
      if (s && Date.parse(s.expiresAt) <= Date.now()) signOut("expired");
    }, 15_000);
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => {
      clearInterval(check);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [ctx, signOut]);

  // Navigating counts as activity too
  useEffect(() => {
    const s = sessionRef.current;
    if (!s) return;
    const next = { ...s, expiresAt: nextExpiry() };
    sessionRef.current = next;
    writeSessionCookie(next);
  }, [pathname]);

  if (!ctx) return <>{fallback}</>;
  return (
    <Ctx.Provider value={{ ...ctx, can: (p) => can(ctx.staff.role, p), signOut }}>{children}</Ctx.Provider>
  );
}

/* ---------- data loading ---------- */

export type Loadable<T> =
  | { state: "loading"; data?: undefined; error?: undefined }
  | { state: "ready"; data: T; error?: undefined }
  | { state: "error"; data?: undefined; error: Error };

/**
 * Runs an async data-layer call and tracks loading / ready / error. Changing
 * `deps` shows loading again; `reload()` (after a write, or "Try again")
 * refreshes in place, keeping the current data on screen until it lands.
 */
export function useLoad<T>(load: () => Promise<T>, deps: DependencyList): Loadable<T> & { reload: () => void } {
  const depsKey = JSON.stringify(deps);
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<{ key: string; value: Loadable<T> } | null>(null);

  useEffect(() => {
    let live = true;
    load()
      .then((data) => live && setResult({ key: depsKey, value: { state: "ready", data } }))
      .catch((error: Error) => live && setResult({ key: depsKey, value: { state: "error", error } }));
    return () => {
      live = false;
    };
    // `load` is a fresh closure each render; depsKey and tick say when to rerun.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, tick]);

  const value: Loadable<T> = result && result.key === depsKey ? result.value : { state: "loading" };
  return { ...value, reload: () => setTick((t) => t + 1) };
}
