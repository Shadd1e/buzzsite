import type { Metadata } from "next";
import { LinkRows } from "@/components/site/LinkRows";
import { Logo } from "@/components/Logo";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Bubble } from "@/components/chat";
import { Faq } from "@/components/site/HelpParts";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { waitlistPage } from "@/content/waitlist";

export const metadata: Metadata = {
  title: waitlistPage.meta.title,
  description: waitlistPage.meta.description,
};

/**
 * Waitlist (DESIGN.md §9.10): split layout. Left, a phone where a "Buzz is
 * live" notification drops in (the moment) over a short convo; right, the
 * form card. Form first on phones, so the action is above the fold.
 * Below: what's inside Buzz, what happens after joining, and waitlist FAQs.
 */
export default function WaitlistPage() {
  const { title, lede, phone, form, success, inside, next, faq } = waitlistPage;
  return (
    <>
      <section
        aria-labelledby="page-title"
        className="aurora bg-white pt-10 pb-18 md:pt-16 md:pb-26"
      >
        <div className="container-page">
          <h1 id="page-title" className="max-w-[14em] text-h1">
            {title}
          </h1>
          <p className="mt-5 max-w-[32em] text-lede text-ink-700">{lede}</p>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
            <figure className="order-2 m-0 flex flex-col items-center gap-3 lg:order-1">
              <PhoneFrame label={phone.label}>
                <div className="flex items-center gap-3 border-b border-line px-4 pt-5 pb-3">
                  <p className="text-[15px] font-semibold text-ink-900">Kemi</p>
                </div>
                <div className="relative flex flex-1 flex-col justify-end gap-2 bg-blue-50 px-3 py-4">
                  <div className="notify-drop absolute inset-x-3 top-3 z-10 flex items-center gap-3 rounded-field border border-white/60 p-3 shadow-float glass">
                    <Logo variant="mark" size="sm" />
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink-900">
                        {phone.notification.title}
                      </p>
                      <p className="text-[13px] leading-snug text-ink-700">
                        {phone.notification.body}
                      </p>
                    </div>
                  </div>
                  {phone.convo.map((m, i) =>
                    m.from === "me" ? (
                      <Bubble
                        key={i}
                        variant="out"
                        time={m.time}
                        status={"status" in m ? m.status : undefined}
                      >
                        {m.text}
                      </Bubble>
                    ) : (
                      <Bubble
                        key={i}
                        variant="in"
                        sender={{ name: m.from }}
                        onTint
                        time={m.time}
                      >
                        {m.text}
                      </Bubble>
                    ),
                  )}
                </div>
              </PhoneFrame>
              <figcaption className="text-[13px] text-ink-500">
                {phone.caption}
              </figcaption>
            </figure>
            <div className="order-1 lg:order-2">
              <WaitlistForm form={form} success={success} />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="inside-title" className="border-t border-line">
        <div className="container-page section-y grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div>
            <h2 id="inside-title" className="max-w-[12em] text-h2">
              {inside.title}
            </h2>
            <p className="mt-5 max-w-[24em] text-lede text-ink-700">
              {inside.lede}
            </p>
          </div>
          <LinkRows rows={inside.rows} />
        </div>
      </section>

      <section aria-labelledby="next-title" className="bg-mist section-y">
        <div className="container-page">
          <h2 id="next-title" className="mb-10 text-h2">
            {next.title}
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {next.steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-blue-600 pt-5">
                <span className="text-[15px] font-semibold text-blue-600 tabular-nums">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-h3">{s.title}</h3>
                <p className="mt-2 max-w-[28em] text-[16px] leading-relaxed text-ink-700">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="container-page section-y">
        <div className="mx-auto max-w-[760px]">
          <h2 id="faq-title" className="mb-6 text-h2">
            {faq.title}
          </h2>
          <Faq items={faq.items} />
        </div>
      </section>
    </>
  );
}
