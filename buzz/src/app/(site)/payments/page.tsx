import type { Metadata } from "next";
import { Convo, type ConvoMessage, type Sender } from "@/components/chat";
import { CtaBand } from "@/components/site/CtaBand";
import { EscrowTrack } from "@/components/site/EscrowTrack";
import { PageHero } from "@/components/site/PageHero";
import { paymentsPage } from "@/content/payments";
import { formatTime, getDispute } from "@/lib/data";

export const metadata: Metadata = {
  title: paymentsPage.meta.title,
  description: paymentsPage.meta.description,
};

/**
 * Payments (DESIGN.md §9.5). The orchestrated moment is the escrow track:
 * a ₦ token travels the rail as you scroll and each stop lights up.
 */
export default async function PaymentsPage() {
  const { hero, track, disputes, fees, cta } = paymentsPage;
  const dispute = await getDispute("DSP-3068");

  const sunpay: Sender = { name: "SunPay", system: "sunpay" };

  const heroMessages: ConvoMessage[] = hero.convo.messages.map((m) => {
    if (m.variant === "out") return { variant: "out", content: m.text, time: m.time, status: m.status };
    if (m.variant === "system") return { variant: "system", sender: sunpay, content: m.text, time: m.time };
    return { variant: "in", sender: hero.convo.seller, content: m.text, time: m.time };
  });

  // Dispute example from test data (DSP-3068), roles labelled
  const disputeMessages: ConvoMessage[] =
    dispute?.evidence.chat.map((m) => ({
      variant: m.from === "system" ? "system" : "in",
      sender: m.from === "system" ? sunpay : m.from === "buyer" ? disputes.example.buyer : disputes.example.seller,
      showName: true,
      time: formatTime(m.at),
      content: m.text,
    })) ?? [];

  return (
    <>
      <PageHero title={hero.title} lede={hero.lede} cta={hero.cta} messages={heroMessages} convoLabel={hero.convo.label} />

      <section aria-labelledby="track-title" className="container-page section-y">
        <h2 id="track-title" className="mb-14 max-w-[14em] text-h2">
          {track.title}
        </h2>
        <EscrowTrack stops={track.stops} note={track.note} />
      </section>

      <section aria-labelledby="disputes-title" className="aurora bg-mist section-y">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="disputes-title" className="max-w-[12em] text-h2">
              {disputes.title}
            </h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {disputes.rows.map((r) => (
                <li key={r.title} className="py-6">
                  <h3 className="text-h3">{r.title}</h3>
                  <p className="mt-2 max-w-[34em] text-body text-ink-700">{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="self-center">
            <Convo messages={disputeMessages} label={disputes.example.label} className="bg-white/80" />
          </div>
        </div>
      </section>

      <section aria-labelledby="fees-title" className="border-b border-line">
        <div className="container-page grid gap-3 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center md:gap-16 md:py-18">
          <h2 id="fees-title" className="text-[clamp(28px,3vw,38px)] leading-[1.12] font-light tracking-[-0.025em]">
            {fees.title}
          </h2>
          <p className="text-body text-ink-500">{fees.body}</p>
        </div>
      </section>

      <CtaBand title={cta.title} body={cta.body} action={cta.action} />
    </>
  );
}
