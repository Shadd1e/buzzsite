import type { Metadata } from "next";
import { RiderProfile } from "@/components/portal/RiderProfile";

/** The portal session lives in a cookie only the browser reads, so the server never renders this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Rider" };

export default async function RiderPage({ params }: PageProps<"/logistics/portal/riders/[id]">) {
  const { id } = await params;
  return <RiderProfile riderId={id} />;
}
