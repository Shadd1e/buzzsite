import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, SearchX } from "lucide-react";
import { TrackForm } from "@/components/logistics/TrackForm";
import { TrackResult } from "@/components/logistics/TrackResult";
import { logisticsHome, logisticsTrack } from "@/content/logistics";
import { getPublicTracking, listParcels, normaliseTrackingId, TRACKING_ID_PATTERN } from "@/lib/data";

/**
 * Track result (DESIGN.md §10.1). Every test tracking ID is prerendered; any
 * other ID renders on request and shows the "not found" state with the ID
 * format. See /dev/test-ids for an ID in every state.
 */
export async function generateStaticParams() {
  const parcels = await listParcels();
  return parcels.map((p) => ({ id: p.trackingId }));
}

export async function generateMetadata({ params }: PageProps<"/logistics/track/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Tracking ${normaliseTrackingId(decodeURIComponent(id))}`,
    robots: { index: false },
  };
}

// Unknown IDs render on request, like help articles (see help/[slug]).
export const instant = false;

export default async function TrackResultPage({ params }: PageProps<"/logistics/track/[id]">) {
  const { id: raw } = await params;
  const id = normaliseTrackingId(decodeURIComponent(raw));
  const parcel = TRACKING_ID_PATTERN.test(id) ? await getPublicTracking(id) : null;
  const { result, notFound } = logisticsTrack;

  return (
    <div className="container-page pt-6 pb-18 md:pt-10 md:pb-26">
      <Link
        href="/logistics/track"
        className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-[15px] font-medium text-ink-700 hover:text-ink-900"
      >
        <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
        {result.another}
      </Link>

      <div className="mt-6">
        {parcel ? (
          <TrackResult parcel={parcel} />
        ) : (
          <section aria-labelledby="page-title" className="max-w-[720px]">
            <SearchX aria-hidden="true" className="size-8 text-ink-900" strokeWidth={1.6} />
            <h1 id="page-title" className="mt-5 text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-light tracking-[-0.03em]">
              {notFound.title}
            </h1>
            <p className="mt-4 text-body text-ink-700">
              {!TRACKING_ID_PATTERN.test(id) && <>{notFound.badFormat} </>}
              You entered <strong className="code-text break-all text-ink-900">{id || "nothing"}</strong>.{" "}
              {notFound.body}
            </p>
            <TrackForm copy={logisticsHome.track} className="mt-10" />
          </section>
        )}
      </div>
    </div>
  );
}
