import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalCompany } from "@/components/portal/Company";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Company" };

export default function Page() {
  return (
    <Suspense>
      <PortalCompany />
    </Suspense>
  );
}
