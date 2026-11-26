import type { Metadata } from "next";
import { Suspense } from "react";
import { GenerateLabel } from "@/components/portal/Label";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Generate label" };

export default function Page() {
  return (
    <Suspense>
      <GenerateLabel />
    </Suspense>
  );
}
