import type { Metadata } from "next";
import type { ConvoMessage, Sender } from "@/components/chat";
import { CareersRoles } from "@/components/site/CareersRoles";
import { PageHero } from "@/components/site/PageHero";
import { careersPage } from "@/content/careers";

export const metadata: Metadata = {
  title: careersPage.meta.title,
  description: careersPage.meta.description,
};

/**
 * Careers (DESIGN.md §9.8): hero convo with an honest reply, how we hire
 * (a real sequence, so numbered; steps still [confirm]), open roles with team
 * chips and an empty state with the email CTA.
 */
export default function CareersPage() {
  const { hero, steps, roles } = careersPage;
  const team: Sender = { name: hero.convo.team.name, system: "buzz" };
  const messages: ConvoMessage[] = hero.convo.messages.map((m) =>
    m.variant === "out"
      ? { variant: "out", content: m.text, time: m.time, status: m.status }
      : { variant: "in", sender: team, showName: true, content: m.text, time: m.time },
  );

  return (
    <>
      <PageHero title={hero.title} lede={hero.lede} messages={messages} convoLabel={hero.convo.label} />

      <section aria-labelledby="steps-title" className="container-page section-y">
        <h2 id="steps-title" className="text-h2">
          {steps.title}
        </h2>
        <p className="mt-3 mb-10 text-[15px] text-ink-500">{steps.note}</p>
        <ol className="grid gap-6 md:grid-cols-4">
          {steps.items.map((s, i) => (
            <li key={s.title} className="border-t-2 border-line pt-5">
              <span className="text-[15px] font-semibold text-blue-600 tabular-nums">{i + 1}</span>
              <h3 className="mt-2 text-h3">{s.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-700">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="roles-title" className="container-page pb-18 md:pb-26">
        <h2 id="roles-title" className="mb-8 text-h2">
          {roles.title}
        </h2>
        <CareersRoles teams={roles.teams} empty={roles.empty} />
      </section>
    </>
  );
}
