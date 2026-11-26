import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { StatusPill } from "@/components/StatusPill";
import { CtaBand } from "@/components/site/CtaBand";
import { JourneyLine } from "@/components/logistics/JourneyLine";
import { TrackForm } from "@/components/logistics/TrackForm";
import { logisticsHome } from "@/content/logistics";

export const metadata: Metadata = {
  title: { absolute: logisticsHome.meta.title },
  description: logisticsHome.meta.description,
};

const textLink =
  "inline-flex min-h-11 items-center text-[16px] font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 transition-colors duration-(--dur-1) ease-out hover:decoration-blue-700";

/**
 * Logistics home (DESIGN.md §10.1, brand register, lighter). Three ways in
 * below the journey: track a parcel, apply as a company, sign up as an
 * individual rider (company riders are pointed to their company). The orchestrated
 * moment is the journey line: a parcel dot travels Lagos → Abuja and each
 * scan point lights up with a system bubble. Everything else stays still.
 */
export default function LogisticsHomePage() {
  const { hero, track, journey, paths, how, coverage, cta } = logisticsHome;

  return (
    <>
      <section
        aria-labelledby="page-title"
        className="aurora bg-white pt-12 pb-18 md:pt-20 md:pb-24"
      >
        <div className="container-page">
          <h1 id="page-title" className="max-w-[11em] text-display">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-[30em] text-lede text-ink-700">
            {hero.lede}
          </p>
          <TrackForm copy={track} className="mt-10" />
        </div>
      </section>

      <section
        aria-labelledby="journey-title"
        className="container-page section-y"
      >
        <div className="mb-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <h2 id="journey-title" className="max-w-[11em] text-h2">
            {journey.title}
          </h2>
          <p className="max-w-[32em] text-body text-ink-700">{journey.lede}</p>
        </div>
        <JourneyLine
          stops={journey.stops}
          caption={journey.caption}
          label={journey.label}
        />
      </section>

      {/* Three ways in: separate choices the visitor picks from (card policy §8.2, rule 1) */}
      <section
        aria-labelledby="paths-title"
        className="container-page pb-18 md:pb-26"
      >
        <h2 id="paths-title" className="sr-only">
          {paths.title}
        </h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="flex flex-col rounded-panel bg-mist p-7 md:p-9">
            <h3 className="text-[clamp(26px,2.2vw,30px)] leading-[1.15] font-light tracking-[-0.02em]">
              {paths.buyer.title}
            </h3>
            <p className="mt-3 max-w-[28em] text-body text-ink-700">
              {paths.buyer.body}
            </p>
            <div
              aria-hidden="true"
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <span className="code-text inline-flex h-11 items-center rounded-full bg-white px-4 text-[15px] text-ink-900">
                {paths.buyer.example}
              </span>
              <StatusPill status="out_for_delivery" />
            </div>
            <div className="mt-auto pt-8">
              <ButtonLink href={paths.buyer.action.href} size="lg">
                {paths.buyer.action.label}
              </ButtonLink>
            </div>
          </article>

          <article className="flex flex-col rounded-panel bg-blue-600 p-7 text-white md:p-9">
            <h3 className="text-[clamp(26px,2.2vw,30px)] leading-[1.15] font-light tracking-[-0.02em] text-white">
              {paths.partner.title}
            </h3>
            <p className="mt-3 max-w-[28em] text-body text-white">
              {paths.partner.body}
            </p>
            <ul className="mt-8 flex flex-col gap-2.5">
              {paths.partner.points.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2.5 text-[16px] font-medium"
                >
                  <Check
                    aria-hidden="true"
                    className="size-5 shrink-0"
                    strokeWidth={1.8}
                  />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-8">
              <ButtonLink
                href={paths.partner.action.href}
                variant="light"
                size="lg"
              >
                {paths.partner.action.label}
              </ButtonLink>
              <Link
                href={paths.partner.more.href}
                className="inline-flex min-h-11 items-center text-[15px] font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
              >
                {paths.partner.more.label}
              </Link>
            </div>
          </article>

          <article className="flex flex-col rounded-panel bg-mist p-7 md:p-9">
            <h3 className="text-[clamp(26px,2.2vw,30px)] leading-[1.15] font-light tracking-[-0.02em]">
              {paths.rider.title}
            </h3>
            <p className="mt-3 max-w-[28em] text-body text-ink-700">
              {paths.rider.body}
            </p>
            <ul className="mt-8 flex flex-col gap-2.5">
              {paths.rider.points.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2.5 text-[16px] font-medium text-ink-900"
                >
                  <Check
                    aria-hidden="true"
                    className="size-5 shrink-0 text-blue-600"
                    strokeWidth={1.8}
                  />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-8">
              <ButtonLink href={paths.rider.action.href} size="lg">
                {paths.rider.action.label}
              </ButtonLink>
              <Link href={paths.rider.signIn.href} className={textLink}>
                {paths.rider.signIn.label}
              </Link>
            </div>
          </article>
        </div>
        <p className="mt-6 text-[15px] text-ink-700">
          {paths.companyRider.before}{" "}
          <Link
            href={paths.companyRider.href}
            className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
          >
            {paths.companyRider.label}
          </Link>
        </p>
      </section>

      <section aria-labelledby="how-title" className="border-t border-line">
        <div className="container-page section-y grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <h2 id="how-title" className="max-w-[10em] text-h2">
              {how.title}
            </h2>
            <Link href={how.link.href} className={`${textLink} mt-6`}>
              {how.link.label}
            </Link>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {how.steps.map((s, i) => (
              <li
                key={s.title}
                className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-5 py-6"
              >
                <span className="grid size-10 place-items-center rounded-full bg-blue-50 text-[15px] font-semibold text-blue-700 tabular-nums">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="text-h3">{s.title}</h3>
                  <p className="mt-1.5 max-w-[34em] text-body text-ink-700">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="coverage-title"
        className="aurora bg-mist section-y"
      >
        <div className="container-page">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <h2 id="coverage-title" className="text-h2">
              {coverage.title}
            </h2>
            <p className="max-w-[32em] text-body text-ink-700">
              {coverage.lede}
            </p>
          </div>
          <ul className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {coverage.areas.map((a) => (
              <li key={a.title} className="border-t-2 border-ink-900 pt-5">
                <h3 className="text-h3">{a.title}</h3>
                <p className="mt-2 text-body text-ink-700">{a.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-start gap-1">
            <p className="text-[15px] text-ink-500">{coverage.pending}</p>
            <Link href={coverage.link.href} className={textLink}>
              {coverage.link.label}
            </Link>
          </div>
        </div>
      </section>

      <CtaBand title={cta.title} body={cta.body} action={cta.action} />
    </>
  );
}
