import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalRates } from "@/components/portal/Rates";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Rates" };

export default function Page() {
  return (
    <Suspense>
      <PortalRates />
    </Suspense>
  );
}
