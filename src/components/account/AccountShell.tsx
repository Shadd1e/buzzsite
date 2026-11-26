"use client";

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { RiderShell } from "@/components/rider/RiderShell";
import { useAccount } from "./session";

/**
 * Shell for riders and pending accounts (product register): logo, the area
 * name, who's signed in and Sign out. No other navigation (DESIGN.md §10.1
 * review status). The rider portal's own menu comes with its build step.
 */
export function AccountShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useAccount();
  const area = session.status === "pending_review" ? "Account review" : "Rider";
  return (
    <div className="min-h-dvh bg-mist">
      <Header area={area}>
        <p className="hidden min-w-0 truncate text-[14px] text-ink-700 sm:block">{session.name}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-[14px] font-semibold text-ink-900 hover:bg-mist"
        >
          <LogOut aria-hidden="true" className="size-4" strokeWidth={1.8} />
          Sign out
        </button>
      </Header>
      <main id="account-main" className="px-4 pt-8 pb-16 md:px-8 md:pt-12">
        {children}
      </main>
    </div>
  );
}

function Header({ area, children }: { area: string; children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Logo size="sm" />
        <span className="truncate text-[13px] font-medium text-ink-500">{area}</span>
      </div>
      <TestDataRibbon placement="docked" />
      {children}
    </header>
  );
}

/** Static shell while the session loads (it lives in a cookie only the browser reads). */
export function AccountShellFallback() {
  return (
    <div className="min-h-dvh bg-mist" aria-busy="true">
      <Header area="Signing in" />
    </div>
  );
}

/**
 * Picks the shell for the signed-in account: active riders get the rider
 * portal (sidebar and bottom bar); pending accounts get the plain shell with no
 * other navigation (DESIGN.md §10.1 review status).
 */
export function AccountFrame({ children }: { children: ReactNode }) {
  const { session } = useAccount();
  if (session.status === "active") return <RiderShell>{children}</RiderShell>;
  return <AccountShell>{children}</AccountShell>;
}
