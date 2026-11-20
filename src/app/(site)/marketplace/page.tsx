import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Home, Wrench } from "lucide-react";
import { Convo, type ConvoMessage } from "@/components/chat";
import { CtaBand } from "@/components/site/CtaBand";
import { DepotMasonry, DepotSearch } from "@/components/site/DepotMasonry";
import { depotPage } from "@/content/depot";

export const metadata: Metadata = {
  title: depotPage.meta.title,
  description: depotPage.meta.description,
};

/**
 * Depot (DESIGN.md §9.4). The orchestrated moment: the masonry of listing
 * cards assembles column by column on load. The hero search and chips filter
 * the sample listings below.
 */
export default function DepotPage() {
  const { hero, listings, categories, safety, cta } = depotPage;
  const heroMessages: ConvoMessage[] = hero.convo.messages.map((m) =>
    m.variant === "in"
      ? { variant: "in", sender: hero.convo.landlord, content: m.text, time: m.time }
      : { variant: "out", content: m.text, time: m.time, status: m.status },
  );

  return (
    <>
      <section aria-labelledby="page-title" className="aurora bg-white pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <h1 id="page-title" className="max-w-[14em] text-h1">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-[34em] text-lede text-ink-700">{hero.lede}</p>
            <DepotSearch label={hero.searchLabel} placeholder={hero.searchPlaceholder} chips={hero.chips} note={hero.filtersNote} />
          </div>
          <div className="w-full max-w-[460px] justify-self-center lg:justify-self-end">
            <Convo messages={heroMessages} start="mount" delay={300} label={hero.convo.label} className="bg-blue-50/90 backdrop-blur-sm" />
          </div>
        </div>
      </section>

      <section id="listings" aria-labelledby="listings-title" className="container-page scroll-mt-24 pt-10 pb-18 md:pb-26">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="listings-title" className="text-h3">
            {listings.title}
          </h2>
          <p className="text-[14px] text-ink-500">{listings.note}</p>
        </div>
        <DepotMasonry items={listings.items} empty={listings.empty} />
      </section>

      <section aria-labelledby="categories-title" className="container-page pb-18 md:pb-26">
        <h2 id="categories-title" className="mb-10 max-w-[14em] text-h2">
          {categories.title}
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {categories.items.map((c) => (
            <li key={c.id}>
              <article
                className={
                  "image" in c && c.image
                    ? "relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-panel bg-mist p-6 md:aspect-[3/4]"
                    : "relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-panel bg-blue-50 p-6 md:aspect-[3/4] md:min-h-0"
                }
              >
                {"image" in c && c.image ? (
                  <>
                    <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="-z-10 object-cover" />
                    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-navy/85 via-navy/50 to-transparent" />
                  </>
                ) : (
                  <span className="absolute inset-x-0 top-0 bottom-28 -z-10 grid place-items-center">
                    <span className="flex flex-col items-center gap-2 text-[13px] text-ink-700">
                      {c.id === "housing" ? (
                        <Home aria-hidden="true" className="size-12 text-blue-600" strokeWidth={1.2} />
                      ) : (
                        <Wrench aria-hidden="true" className="size-12 text-blue-600" strokeWidth={1.2} />
                      )}
                      [photo pending]
                    </span>
                  </span>
                )}
                {(() => {
                  const onPhoto = "image" in c && !!c.image;
                  return (
                    <>
                      <h3 className={onPhoto ? "text-h3 text-white" : "text-h3"}>{c.title}</h3>
                      <p className={onPhoto ? "mt-2 text-[16px] leading-relaxed text-white" : "mt-2 text-[16px] leading-relaxed text-ink-700"}>
                        {c.body}
                      </p>
                      {"image" in c && c.image && <p className="mt-3 text-[12px] text-white/90">Photo: {c.image.credit}</p>}
                    </>
                  );
                })()}
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="safety-title" className="border-t border-line">
        <div className="container-page section-y grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <h2 id="safety-title" className="max-w-[10em] text-h2">
            {safety.title}
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {safety.rows.map((r) => (
              <li key={r.title} className="py-6">
                <h3 className="text-h3">{r.title}</h3>
                <p className="mt-2 max-w-[36em] text-body text-ink-700">{r.body}</p>
                {"link" in r && r.link && (
                  <Link
                    href={r.link.href}
                    className="mt-3 inline-flex min-h-11 items-center gap-1 text-[16px] font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-4 hover:decoration-blue-600"
                  >
                    {r.link.label}
                    {"external" in r.link && r.link.external && <span aria-hidden="true">↗</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title={cta.title} body={cta.body} action={cta.action} />
    </>
  );
}
