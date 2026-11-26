import type { Metadata } from "next";
import { RiderMore } from "@/components/rider/More";

/** Depends on the account cookie, which only the browser reads (see the review page). */
export const instant = false;

export const metadata: Metadata = { title: "More" };

/** Rider portal: the More menu on phones. */
export default function Page() {
  return <RiderMore />;
}
