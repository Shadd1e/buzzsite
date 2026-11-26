import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountFrame, AccountShellFallback } from "@/components/account/AccountShell";
import { AccountSessionProvider } from "@/components/account/session";

export const metadata: Metadata = {
  title: { default: "Buzz Logistics", template: "%s · Buzz Logistics" },
  robots: { index: false },
};

/**
 * Riders and pending accounts (product register): the review status page and
 * the rider portal. The proxy has already checked the account cookie; the
 * provider reads it in the browser and AccountFrame picks the shell.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AccountShellFallback />}>
      <AccountSessionProvider fallback={<AccountShellFallback />}>
        <AccountFrame>{children}</AccountFrame>
      </AccountSessionProvider>
    </Suspense>
  );
}
