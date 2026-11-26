import type { Metadata } from "next";
import { RiderOverview } from "@/components/rider/Overview";

/**
 * Everything here depends on the account cookie, which only the browser reads,
 * so the server never renders this segment. Opt out of the instant-navigation
 * check, as the other request-time pages do.
 */
export const instant = false;

export const metadata: Metadata = { title: "Overview" };

/** Rider portal overview: active company and individual riders land here after sign in. */
export default function RiderPage() {
  return <RiderOverview />;
}
