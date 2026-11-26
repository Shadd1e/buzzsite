import type { Metadata } from "next";
import { Suspense } from "react";
import { Overview } from "@/components/portal/Overview";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Overview" };

export default function PortalOverviewPage() {
  return (
    <Suspense>
      <Overview />
    </Suspense>
  );
}
