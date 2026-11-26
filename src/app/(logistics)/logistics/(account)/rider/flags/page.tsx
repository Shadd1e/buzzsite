import type { Metadata } from "next";
import { RiderFlags } from "@/components/rider/Flags";

/** Depends on the account cookie, which only the browser reads (see the review page). */
export const instant = false;

export const metadata: Metadata = { title: "Flags" };

/** Rider portal: flags about this rider. */
export default function Page() {
  return <RiderFlags />;
}
