import type { Metadata } from "next";
import { Suspense } from "react";
import { Team } from "@/components/portal/Team";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <Suspense>
      <Team />
    </Suspense>
  );
}
