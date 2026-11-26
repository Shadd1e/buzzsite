import type { Metadata } from "next";
import { RiderRates } from "@/components/rider/Rates";

/** Depends on the account cookie, which only the browser reads (see the review page). */
export const instant = false;

export const metadata: Metadata = { title: "Rates" };

/** Rider portal: rates (individual riders). */
export default function Page() {
  return <RiderRates />;
}
