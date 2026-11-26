import type { Metadata } from "next";
import { RiderProfile } from "@/components/rider/Profile";

/** Depends on the account cookie, which only the browser reads (see the review page). */
export const instant = false;

export const metadata: Metadata = { title: "Profile" };

/** Rider portal: profile. */
export default function Page() {
  return <RiderProfile />;
}
