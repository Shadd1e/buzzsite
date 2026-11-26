import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalParcels } from "@/components/portal/Parcels";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Parcels" };

export default function Page() {
  return (
    <Suspense>
      <PortalParcels />
    </Suspense>
  );
}
