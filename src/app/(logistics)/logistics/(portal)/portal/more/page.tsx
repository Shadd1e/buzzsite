import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalMore } from "@/components/portal/More";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "More" };

export default function Page() {
  return (
    <Suspense>
      <PortalMore />
    </Suspense>
  );
}
