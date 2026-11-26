import type { Metadata } from "next";
import { RiderDisputes } from "@/components/rider/Disputes";

/** Depends on the account cookie, which only the browser reads (see the review page). */
export const instant = false;

export const metadata: Metadata = { title: "Disputes and claims" };

/** Rider portal: disputes and claims (individual riders). */
export default function Page() {
  return <RiderDisputes />;
}
