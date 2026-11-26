import type { Metadata } from "next";
import { AddRider } from "@/components/portal/AddRider";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Add rider" };

export default function AddRiderPage() {
  return <AddRider />;
}
