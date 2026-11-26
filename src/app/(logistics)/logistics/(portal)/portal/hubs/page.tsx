import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalHubs } from "@/components/portal/Hubs";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Hubs and pickup points" };

export default function Page() {
  return (
    <Suspense>
      <PortalHubs />
    </Suspense>
  );
}
