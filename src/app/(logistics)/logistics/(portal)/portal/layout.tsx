import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalShell, PortalShellFallback } from "@/components/portal/PortalShell";
import { PortalSessionProvider } from "@/components/portal/session";

export const metadata: Metadata = {
  title: { default: "Partner portal", template: "%s · Partner portal · Buzz Logistics" },
  robots: { index: false },
};

/**
 * Partner portal (DESIGN.md §10.2, product register). The proxy has already
 * checked there's a session; the provider loads it in the browser and the
 * shell draws the sidebar and top bar around each screen.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    // Everything in the portal depends on the session, which only exists at
    // request time in the browser, so the static shell is the fallback.
    <Suspense fallback={<PortalShellFallback />}>
      <PortalSessionProvider fallback={<PortalShellFallback />}>
        <PortalShell>{children}</PortalShell>
      </PortalSessionProvider>
    </Suspense>
  );
}
