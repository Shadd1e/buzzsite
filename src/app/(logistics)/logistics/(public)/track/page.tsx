import type { Metadata } from "next";
import { TrackForm } from "@/components/logistics/TrackForm";
import { logisticsHome, logisticsTrack } from "@/content/logistics";

export const metadata: Metadata = {
  title: logisticsTrack.meta.title,
  description: logisticsTrack.meta.description,
};

/**
 * Track (DESIGN.md §10.1): the tracking form, where to find the ID, and the
 * privacy promise. Results live at /logistics/track/[id]. No motion here.
 */
export default function TrackPage() {
  const { hero, where, privacy } = logisticsTrack;
  return (
    <>
      <section aria-labelledby="page-title" className="aurora bg-white pt-12 pb-18 md:pt-20 md:pb-24">
        <div className="container-page">
          <h1 id="page-title" className="text-h1">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-[30em] text-lede text-ink-700">{hero.lede}</p>
          <TrackForm copy={logisticsHome.track} className="mt-10" />
        </div>
      </section>

      <section aria-labelledby="where-title" className="container-page section-y">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <h2 id="where-title" className="max-w-[10em] text-h2">
            {where.title}
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {where.rows.map((r) => (
              <li key={r.title} className="py-6">
                <h3 className="text-h3">{r.title}</h3>
                <p className="mt-2 max-w-[34em] text-body text-ink-700">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-12 rounded-field bg-blue-50 px-5 py-4 text-[16px] font-medium text-ink-900">{privacy}</p>
      </section>
    </>
  );
}
