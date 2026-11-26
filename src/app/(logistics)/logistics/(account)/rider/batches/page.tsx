import type { Metadata } from "next";
import { RiderBatches } from "@/components/rider/Batches";

/** Depends on the account cookie, which only the browser reads (see the review page). */
export const instant = false;

export const metadata: Metadata = { title: "Batches" };

/** Rider portal: batches (mother QR), read-only. */
export default function Page() {
  return <RiderBatches />;
}
