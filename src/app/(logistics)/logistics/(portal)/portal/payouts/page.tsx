import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalPayouts } from "@/components/portal/Payouts";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Payouts" };

export default function Page() {
  return (
    <Suspense>
      <PortalPayouts />
    </Suspense>
  );
}
