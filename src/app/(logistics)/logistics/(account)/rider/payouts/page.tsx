import type { Metadata } from "next";
import { RiderPayouts } from "@/components/rider/Payouts";

/** Depends on the account cookie, which only the browser reads (see the review page). */
export const instant = false;

export const metadata: Metadata = { title: "Payouts" };

/** Rider portal: payouts (individual riders). */
export default function Page() {
  return <RiderPayouts />;
}
