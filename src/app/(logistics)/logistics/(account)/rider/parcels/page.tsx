import type { Metadata } from "next";
import { RiderParcels } from "@/components/rider/Parcels";

/** Depends on the account cookie, which only the browser reads (see the review page). */
export const instant = false;

export const metadata: Metadata = { title: "Parcels" };

/** Rider portal: parcels (only theirs). */
export default function Page() {
  return <RiderParcels />;
}
