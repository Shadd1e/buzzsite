import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Bubble } from "@/components/chat";
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
 */
export default function WaitlistPage() {
  const { title, lede, phone, form, success } = waitlistPage;
  return (
    <section aria-labelledby="page-title" className="aurora bg-white pt-10 pb-18 md:pt-16 md:pb-26">
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
                    <p className="text-[14px] font-semibold text-ink-900">{phone.notification.title}</p>
                    <p className="text-[13px] leading-snug text-ink-700">{phone.notification.body}</p>
                  </div>
                </div>
                {phone.convo.map((m, i) =>
                  m.from === "me" ? (
                    <Bubble key={i} variant="out" time={m.time} status={"status" in m ? m.status : undefined}>
                      {m.text}
                    </Bubble>
                  ) : (
                    <Bubble key={i} variant="in" sender={{ name: m.from }} onTint time={m.time}>
                      {m.text}
                    </Bubble>
                  ),
                )}
              </div>
            </PhoneFrame>
            <figcaption className="text-[13px] text-ink-500">{phone.caption}</figcaption>
          </figure>
          <div className="order-1 lg:order-2">
            <WaitlistForm form={form} success={success} />
          </div>
        </div>
      </div>
    </section>
  );
}
