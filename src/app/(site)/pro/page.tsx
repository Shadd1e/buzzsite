import type { Metadata } from "next";
import { Convo, type ConvoMessage } from "@/components/chat";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { BookingSlip, ProIdCard, ProProducts, ProfessionSwitcher } from "@/components/site/ProParts";
import { proPage, toolLines, toolNames } from "@/content/pro";
import { listParcels } from "@/lib/data";

export const metadata: Metadata = {
  title: proPage.meta.title,
  description: proPage.meta.description,
};

/**
 * Buzz Pro (DESIGN.md §9.3): the only dark marketing hero. The orchestrated
 * moment is the profession switcher: the preview cross-fades and re-lays out.
 */
export default async function ProPage() {
  const { hero, switcher, products, pause, cta } = proPage;
  const parcels = await listParcels({ partnerId: "BZL-C-1042" });

  const messages: ConvoMessage[] = hero.convo.messages.map((m) => {
    if (m.variant === "out") return { variant: "out", content: m.text, time: m.time, status: m.status };
    if (m.variant === "booking")
      return { variant: "in", sender: hero.convo.emeka, time: m.time, content: <BookingSlip when="Tomorrow, 10:00" /> };
    return { variant: "in", sender: hero.convo.emeka, time: m.time, content: m.text };
  });

  // Sample orders for the Business Centre vignette, from test data
  const orders = parcels
    .filter((p) => ["out_for_delivery", "delivered", "at_pickup_point"].includes(p.status))
    .slice(0, 3)
    .map((p) => ({ id: p.orderId, item: p.item, status: p.status }));

  return (
    <>
      <PageHero
        tone="navy"
        title={hero.title}
        lede={hero.lede}
        cta={hero.cta}
        aside={
          <div className="flex flex-col gap-4">
            <ProIdCard {...hero.card} />
            <Convo messages={messages} start="mount" delay={300} label={hero.convo.label} className="bg-white/95" />
          </div>
        }
      />

      <section aria-labelledby="switcher-title" className="container-page section-y">
        <h2 id="switcher-title" className="max-w-[14em] text-h2">
          {switcher.title}
        </h2>
        <p className="mt-4 mb-10 text-lede text-ink-700">{switcher.lede}</p>
        <ProfessionSwitcher professions={switcher.professions} toolNames={toolNames} toolLines={toolLines} placeholder={switcher.placeholder} />
      </section>

      <section aria-labelledby="products-title" className="container-page pb-18 md:pb-26">
        <h2 id="products-title" className="mb-10 max-w-[14em] text-h2">
          {products.title}
        </h2>
        <ProProducts
          storefront={products.storefront}
          businessCentre={products.businessCentre}
          showcase={products.showcase}
          orders={orders}
        />
      </section>

      <section aria-labelledby="pause-title" className="border-t border-line">
        <div className="container-page grid gap-4 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center md:gap-16 md:py-18">
          <h2 id="pause-title" className="text-[clamp(28px,3vw,38px)] leading-[1.12] font-light tracking-[-0.025em]">
            {pause.title}
          </h2>
          <p className="max-w-[34em] text-body text-ink-700">{pause.body}</p>
        </div>
      </section>

      <CtaBand title={cta.title} body={cta.body} action={cta.action} />
    </>
  );
}
