import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { contactPage } from "@/content/contact";

export const metadata: Metadata = {
  title: contactPage.meta.title,
  description: contactPage.meta.description,
};

/**
 * Contact (DESIGN.md §9.9). The orchestrated moment: the form panel slides to
 * the chosen topic. Form card + direct channels list.
 */
export default function ContactPage() {
  const { hero, topics, form, channels } = contactPage;
  return (
    <>
      <section aria-labelledby="page-title" className="aurora bg-white pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="container-page">
          <h1 id="page-title" className="max-w-[12em] text-h1">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-[32em] text-lede text-ink-700">{hero.lede}</p>
        </div>
      </section>

      <section aria-label="Contact form" className="container-page pb-16 md:pb-20">
        <ContactForm topics={topics} title={form.title} sent={form.sent} />
      </section>

      <section aria-labelledby="channels-title" className="border-t border-line">
        <div className="container-page grid gap-8 py-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-16 md:py-18">
          <h2 id="channels-title" className="text-[clamp(28px,3vw,38px)] leading-[1.12] font-light tracking-[-0.025em]">
            {channels.title}
          </h2>
          <div>
            <dl className="divide-y divide-line border-y border-line">
              {channels.rows.map((r) => (
                <div key={r.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                  <dt className="text-[15px] font-semibold text-ink-900">{r.label}</dt>
                  <dd className={"href" in r ? "text-[16px]" : "text-[15px] text-ink-500"}>
                    {"href" in r ? (
                      <a href={r.href} className="inline-flex min-h-11 items-center font-semibold text-blue-700 underline underline-offset-4">
                        {r.value}
                      </a>
                    ) : (
                      r.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px] text-ink-700">{channels.note}</p>
          </div>
        </div>
      </section>
    </>
  );
}
