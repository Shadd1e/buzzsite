import type { Metadata } from "next";
import { Riders } from "@/components/portal/Riders";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Riders" };

export default function RidersPage() {
  return <Riders />;
}
