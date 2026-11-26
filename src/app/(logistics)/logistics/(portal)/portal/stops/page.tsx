import type { Metadata } from "next";
import { Suspense } from "react";
import { Stops } from "@/components/portal/Stops";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Stops" };

export default function StopsPage() {
  return (
    <Suspense>
      <Stops />
    </Suspense>
  );
}
