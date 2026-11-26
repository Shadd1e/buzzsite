import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalFlags } from "@/components/portal/Flags";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Flags" };

export default function Page() {
  return (
    <Suspense>
      <PortalFlags />
    </Suspense>
  );
}
