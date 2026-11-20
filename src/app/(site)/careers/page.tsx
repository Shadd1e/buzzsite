import type { Metadata } from "next";
import type { ConvoMessage, Sender } from "@/components/chat";
import { CareersRoles } from "@/components/site/CareersRoles";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { careersPage } from "@/content/careers";

export const metadata: Metadata = {
  title: careersPage.meta.title,
  description: careersPage.meta.description,
};

/**
 * Careers (DESIGN.md §9.8): hero convo with an honest reply, what you'd work
 * on, how we hire
 * (a real sequence, so numbered; steps still [confirm]), open roles with team
 * chips and an empty state, then a CTA band with the email.
 */
export default function CareersPage() {
  const { hero, building, steps, roles, cta } = careersPage;
  const team: Sender = { name: hero.convo.team.name, system: "buzz" };
  const messages: ConvoMessage[] = hero.convo.messages.map((m) =>
    m.variant === "out"
      ? { variant: "out", content: m.text, time: m.time, status: m.status }
      : {
          variant: "in",
          sender: team,
          showName: true,
          content: m.text,
          time: m.time,
        },
  );

  return (
    <>
      <PageHero
        title={hero.title}
        lede={hero.lede}
        messages={messages}
        convoLabel={hero.convo.label}
      />

      <section aria-labelledby="building-title" className="section-y">
        <div className="container-page">
          <h2 id="building-title" className="max-w-[14em] text-h2">
            {building.title}
          </h2>
          <p className="mt-5 max-w-[34em] text-lede text-ink-700">
            {building.lede}
          </p>
          <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
            {building.rows.map((r) => (
              <li key={r.title} className="border-t border-line-strong pt-5">
                <h3 className="text-h3">{r.title}</h3>
                <p className="mt-2 text-body text-ink-700">{r.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-12 max-w-[40em] text-[16px] text-ink-700">
            {building.note}
          </p>
        </div>
      </section>

      <section aria-labelledby="steps-title" className="bg-mist">
        <div className="container-page section-y">
          <h2 id="steps-title" className="text-h2">
            {steps.title}
          </h2>
          <p className="mt-3 mb-10 text-[15px] text-ink-500">{steps.note}</p>
          <ol className="grid gap-6 md:grid-cols-4">
            {steps.items.map((s, i) => (
              <li key={s.title} className="border-t-2 border-line pt-5">
                <span className="text-[15px] font-semibold text-blue-600 tabular-nums">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-h3">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-700">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="roles-title"
        className="container-page section-y"
      >
        <h2 id="roles-title" className="mb-8 text-h2">
          {roles.title}
        </h2>
        <CareersRoles teams={roles.teams} empty={roles.empty} />
      </section>

      <CtaBand
        title={cta.title}
        body={cta.body}
        action={cta.action}
        secondary={cta.secondary}
      />
    </>
  );
}
