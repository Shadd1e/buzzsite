import type { Metadata } from "next";
import { Phone, ShieldAlert } from "lucide-react";
import { Bubble } from "@/components/chat";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { SafetyMap } from "@/components/site/SafetyMap";
import { safetyPage } from "@/content/safety";

export const metadata: Metadata = {
  title: safetyPage.meta.title,
  description: safetyPage.meta.description,
};

/**
 * Safety (DESIGN.md §9.6). The orchestrated moment is the alert radius map:
 * a pin drops, the red ring expands, and phones inside it light up.
 */
export default function SafetyPage() {
  const { hero, map, how, emergency, cta } = safetyPage;

  return (
    <>
      <PageHero
        title={hero.title}
        lede={hero.lede}
        cta={hero.cta}
        aside={
          <div className="flex flex-col gap-3 rounded-convo bg-blue-50/90 p-4 backdrop-blur-sm sm:p-6">
            <article aria-label="Example EMBA alert" className="rounded-card border-2 border-alert-600 bg-white p-4">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-tile bg-alert-600 text-white">
                  <ShieldAlert className="size-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-alert-700">
                    {hero.alert.title} from {hero.alert.source}
                  </p>
                  <p className="mt-1 text-[16px] text-ink-900">{hero.alert.body}</p>
                  <p className="mt-1.5 text-[13px] text-ink-500">
                    {hero.alert.area}, <time>{hero.alert.time}</time>
                  </p>
                </div>
              </div>
            </article>
            <p className="px-1 pt-2 text-[13px] font-semibold text-ink-700">{hero.reply.group}</p>
            {hero.reply.messages.map((m, i) =>
              m.from === "me" ? (
                <Bubble key={i} variant="out" time={m.time} status={"status" in m ? m.status : undefined}>
                  {m.text}
                </Bubble>
              ) : (
                <Bubble key={i} variant="in" sender={{ name: m.from }} showName onTint time={m.time}>
                  {m.text}
                </Bubble>
              ),
            )}
          </div>
        }
      />

      <section aria-labelledby="map-title" className="container-page section-y">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-center lg:gap-16">
          <div>
            <h2 id="map-title" className="max-w-[12em] text-h2">
              {map.title}
            </h2>
            <p className="mt-5 max-w-[30em] text-body text-ink-700">{map.lede}</p>
          </div>
          <SafetyMap caption={map.caption} insideLabel={map.inside} outsideLabel={map.outside} />
        </div>
      </section>

      <section aria-labelledby="how-title" className="border-t border-line">
        <div className="container-page section-y grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <h2 id="how-title" className="text-h2">
            {how.title}
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {how.rows.map((r) => (
              <li key={r.title} className="py-6">
                <h3 className="text-h3">{r.title}</h3>
                <p className="mt-2 max-w-[36em] text-body text-ink-700">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="emergency-title" className="container-page pb-18 md:pb-26">
        <div role="note" className="flex flex-col gap-5 rounded-panel border-2 border-alert-600 bg-alert-50 p-6 sm:flex-row sm:items-center sm:justify-between md:p-10">
          <div>
            <h2 id="emergency-title" className="text-[clamp(26px,2.8vw,36px)] leading-[1.15] font-light tracking-[-0.02em] text-ink-900">
              {emergency.title}
            </h2>
            <p className="mt-2 text-[20px] font-semibold text-alert-700">{emergency.body}</p>
          </div>
          <a
            href="tel:112"
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-alert-600 px-7 text-[16px] font-semibold text-white hover:bg-alert-700"
          >
            <Phone aria-hidden="true" className="size-5" strokeWidth={1.8} />
            Call 112
          </a>
        </div>
      </section>

      <CtaBand title={cta.title} body={cta.body} action={cta.action} />
    </>
  );
}
