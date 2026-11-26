import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalBatches } from "@/components/portal/Batches";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Batches" };

export default function Page() {
  return (
    <Suspense>
      <PortalBatches />
    </Suspense>
  );
}
