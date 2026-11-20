import type { Metadata } from "next";
import { VoiceNote, type ConvoMessage } from "@/components/chat";
import { AppBento } from "@/components/site/AppBento";
import { BuzzDropScreen, BuzzIdScreen, ChatsScreen, StatusScreen } from "@/components/site/AppScreens";
import { CtaBand } from "@/components/site/CtaBand";
import { FeatureStage } from "@/components/site/FeatureStage";
import { PageHero } from "@/components/site/PageHero";
import { appPage } from "@/content/app";
import { formatTime, getMe, listChats } from "@/lib/data";

export const metadata: Metadata = {
  title: appPage.meta.title,
  description: appPage.meta.description,
};

/**
 * The App (DESIGN.md §9.2). The orchestrated moment is the feature stage:
 * the sticky phone swaps screens as the features scroll past.
 */
export default async function AppPage() {
  const { hero, stage, bento, buzzId, cta } = appPage;
  const [me, chats] = await Promise.all([getMe(), listChats()]);

  const heroMessages: ConvoMessage[] = hero.convo.messages.map((m) => {
    if (m.variant === "out") return { variant: "out", content: m.text, time: m.time, status: m.status };
    return {
      variant: "in",
      sender: hero.convo.tobi,
      time: m.time,
      typingFirst: "typingFirst" in m ? m.typingFirst : undefined,
      content: "voice" in m ? <VoiceNote duration={m.voice} /> : m.text,
    };
  });

  const chatPreviews = chats.slice(0, 6).map((c) => {
    const last = c.messages.at(-1);
    return {
      id: c.id,
      name: c.name,
      last: last?.kind === "voice" ? "Voice note" : (last?.text ?? ""),
      time: last ? formatTime(last.at) : "",
      unread: c.unread,
    };
  });

  const screens = {
    chats: <ChatsScreen chats={chatPreviews} />,
    "buzz-id": <BuzzIdScreen name={me.name} handle={me.buzzId} />,
    buzzdrop: <BuzzDropScreen handle={me.buzzId} />,
    status: <StatusScreen people={["Tobi", "Naturally Kemi", "Chidi", "Auntie Rose"]} />,
  } as const;

  const family = chats.find((c) => c.type === "group");

  return (
    <>
      <PageHero title={hero.title} lede={hero.lede} cta={hero.cta} messages={heroMessages} convoLabel={hero.convo.label} />

      <section aria-labelledby="stage-title" className="container-page section-y">
        <h2 id="stage-title" className="max-w-[14em] text-h2">
          {stage.title}
        </h2>
        <div className="mt-6 lg:-mt-6">
          <FeatureStage features={stage.features.map((f) => ({ ...f, screen: screens[f.id] }))} />
        </div>
      </section>

      <section aria-labelledby="bento-title" className="container-page pb-18 md:pb-26">
        <h2 id="bento-title" className="mb-10 max-w-[14em] text-h2">
          {bento.title}
        </h2>
        <AppBento
          items={bento.items}
          groupName={family?.name ?? "Okeke Family"}
          groupMembers={["Chidi", "Auntie Rose", "Uncle Ben", "Ngozi"]}
        />
      </section>

      <section aria-labelledby="buzzid-title" className="aurora bg-mist section-y">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 id="buzzid-title" className="max-w-[13em] text-h2">
              {buzzId.title}
            </h2>
            <p className="mt-5 max-w-[32em] text-body text-ink-700">{buzzId.body}</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-center">
            <p className="code-text rounded-full bg-white px-7 py-4 text-[clamp(22px,2.6vw,32px)] text-ink-900 shadow-hair">
              {buzzId.handle}
            </p>
            <p className="text-[clamp(18px,2vw,24px)] text-ink-500 tabular-nums line-through decoration-ink-700 decoration-2">
              <span className="sr-only">Not your phone number: </span>
              {buzzId.phone}
            </p>
          </div>
        </div>
      </section>

      <CtaBand title={cta.title} body={cta.body} action={cta.action} />
    </>
  );
}
