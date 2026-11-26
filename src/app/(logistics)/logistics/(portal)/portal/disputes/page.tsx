import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalDisputes } from "@/components/portal/Disputes";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Disputes and claims" };

export default function Page() {
  return (
    <Suspense>
      <PortalDisputes />
    </Suspense>
  );
}
