import type { Metadata } from "next";
import type { ConvoMessage, Sender } from "@/components/chat";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { logisticsPartners } from "@/content/logistics";

export const metadata: Metadata = {
  title: logisticsPartners.meta.title,
  description: logisticsPartners.meta.description,
};

/**
 * Logistics partners (DESIGN.md §10.1): why partner, what we expect, the
 * process as 4 steps, CTA "Apply to partner". The orchestrated moment is the
 * hero conversation popping in; everything below stays still.
 */
export default function LogisticsPartnersPage() {
  const { hero, why, expect, process, cta } = logisticsPartners;
  const buzz: Sender = hero.convo.buzz;

  const messages: ConvoMessage[] = hero.convo.messages.map((m) =>
    m.variant === "out"
      ? { variant: "out", content: m.text, time: m.time, status: m.status }
      : { variant: "in", sender: buzz, content: m.text, time: m.time, typingFirst: "typingFirst" in m },
  );

  return (
    <>
      <PageHero title={hero.title} lede={hero.lede} cta={hero.cta} messages={messages} convoLabel={hero.convo.label} />

      {/* Why partner: reasons as list rows, beside the one real object, a price breakdown */}
      <section aria-labelledby="why-title" className="container-page section-y">
        <h2 id="why-title" className="max-w-[12em] text-h2">
          {why.title}
        </h2>
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <ul className="divide-y divide-line border-y border-line">
            {why.rows.map((r) => (
              <li key={r.title} className="py-6">
                <h3 className="text-h3">{r.title}</h3>
                <p className="mt-2 max-w-[34em] text-body text-ink-700">{r.body}</p>
              </li>
            ))}
          </ul>

          <aside aria-labelledby="price-title" className="self-start rounded-panel bg-blue-50 p-7 md:p-9 lg:sticky lg:top-28">
            <h3 id="price-title" className="text-h3">
              {why.price.title}
            </h3>
            <dl className="mt-6 divide-y divide-blue-100 border-t border-blue-100">
              {why.price.rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-[16px] text-ink-700">{r.label}</dt>
                  <dd className="text-right text-[16px] font-semibold text-ink-900 tabular-nums">{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-blue-600 py-4">
              <span className="text-[17px] font-semibold text-ink-900">{why.price.total.label}</span>
              <span className="text-right text-[17px] font-semibold text-blue-700">{why.price.total.value}</span>
            </div>
            <p className="mt-4 text-small text-ink-700">{why.price.note}</p>
          </aside>
        </div>
      </section>

      <section aria-labelledby="expect-title" className="aurora bg-mist section-y">
        <div className="container-page">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <h2 id="expect-title" className="max-w-[12em] text-h2">
              {expect.title}
            </h2>
            <p className="max-w-[32em] text-body text-ink-700">{expect.lede}</p>
          </div>
          <ul className="mt-12 grid gap-x-16 md:grid-cols-2">
            {expect.rows.map((r) => (
              <li key={r.title} className="border-t border-line-strong py-6">
                <h3 className="text-h3">{r.title}</h3>
                <p className="mt-2 max-w-[32em] text-body text-ink-700">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="process-title" className="container-page section-y">
        <h2 id="process-title" className="mb-14 max-w-[12em] text-h2">
          {process.title}
        </h2>
        <div className="relative">
          {/* The line joining the steps: vertical on phones, horizontal from 768px */}
          <div aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-0.5 bg-blue-100 md:hidden" />
          <div aria-hidden="true" className="absolute top-5 right-[12.5%] left-[12.5%] hidden h-0.5 bg-blue-100 md:block" />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {process.steps.map((s, i) => (
              <li key={s.title} className="flex gap-5 md:flex-col md:items-center md:gap-4 md:text-center">
                <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-blue-600 text-[15px] font-semibold text-white tabular-nums">
                  {i + 1}
                </span>
                <div className="pt-1.5 md:pt-0">
                  <h3 className="text-h3">{s.title}</h3>
                  <p className="mt-1.5 max-w-[18em] text-[16px] leading-relaxed text-ink-700">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-12 text-[15px] text-ink-500 md:text-center">{process.note}</p>
      </section>

      <CtaBand title={cta.title} body={cta.body} action={cta.action} secondary={cta.secondary} />
    </>
  );
}
