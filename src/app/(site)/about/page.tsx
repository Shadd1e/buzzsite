import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { FlipPairs } from "@/components/site/FlipPairs";
import { aboutPage } from "@/content/about";

export const metadata: Metadata = {
  title: aboutPage.meta.title,
  description: aboutPage.meta.description,
};

/**
 * About (DESIGN.md §9.7). No hero convo: the statement carries it, in large
 * light type. The orchestrated moment: each problem card turns to its answer
 * as it enters view.
 */
export default function AboutPage() {
  const { hero, pairs, beliefs, team, band } = aboutPage;

  return (
    <>
      <section aria-labelledby="page-title" className="aurora bg-white pt-12 pb-18 md:pt-20 md:pb-26">
        <div className="container-page">
          <h1 id="page-title" className="max-w-[17em] text-[clamp(36px,4.6vw,64px)] leading-[1.08] font-light tracking-[-0.03em]">
            {hero.title}
          </h1>
          <p className="mt-8 max-w-[30em] text-lede text-ink-700">{hero.lede}</p>
        </div>
      </section>

      <section aria-labelledby="pairs-title" className="container-page section-y">
        <h2 id="pairs-title" className="mb-10 max-w-[14em] text-h2">
          {pairs.title}
        </h2>
        <FlipPairs items={pairs.items} />
      </section>

      <section aria-labelledby="beliefs-title" className="border-t border-line">
        <div className="container-page section-y grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <h2 id="beliefs-title" className="text-h2">
            {beliefs.title}
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {beliefs.rows.map((r) => (
              <li key={r.title} className="py-6">
                <h3 className="text-h3">{r.title}</h3>
                <p className="mt-2 max-w-[36em] text-body text-ink-700">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="team-title" className="container-page pb-18 md:pb-26">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="team-title" className="text-h2">
            {team.title}
          </h2>
          <p className="text-[15px] text-ink-500">{team.note}</p>
        </div>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-label="Team photos, pending">
          {Array.from({ length: team.slots }, (_, i) => (
            <li
              key={i}
              className="grid aspect-[4/5] place-items-center rounded-card border-[1.5px] border-dashed border-line-strong text-ink-500"
            >
              <span className="flex flex-col items-center gap-2 text-[13px]">
                <UserRound aria-hidden="true" className="size-7" strokeWidth={1.4} />
                [photo pending]
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="band-title" className="bg-blue-600 py-16 md:py-24">
        <div className="container-page flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <h2 id="band-title" className="max-w-[16em] text-[clamp(28px,3.2vw,40px)] leading-[1.12] font-light tracking-[-0.025em] text-white">
            {band.title}
          </h2>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={band.contact.href} variant="light" size="lg">
              {band.contact.label}
            </ButtonLink>
            <ButtonLink
              href={band.careers.href}
              variant="outlineOnBlue"
              size="lg"
            >
              {band.careers.label}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
