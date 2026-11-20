import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, MessagesSquare, ShieldAlert, Sparkles, Store, Truck, Wallet, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Faq, HelpSearch } from "@/components/site/HelpParts";
import { LinkRows } from "@/components/site/LinkRows";
import { helpArticles, helpPage, helpTopics } from "@/content/help";

export const metadata: Metadata = {
  title: helpPage.meta.title,
  description: helpPage.meta.description,
};

const icons: Record<string, LucideIcon> = { Sparkles, MessagesSquare, Store, Wallet, Briefcase, ShieldAlert, Truck };

/**
 * Help Centre (DESIGN.md §9.11): search over the live gradient, topic cards
 * (cards allowed: separate actionable objects, §8.2), staying-safe rows,
 * common questions and a
 * "Still stuck?" card. Read mode: no orchestrated moment beyond the search.
 */
export default function HelpPage() {
  const { hero, topicsTitle, safe, faq, stuck } = helpPage;
  const topicTitle = Object.fromEntries(helpTopics.map((t) => [t.id, t.title]));

  return (
    <>
      <section aria-labelledby="page-title" className="aurora bg-mist pt-14 pb-16 text-center md:pt-20 md:pb-24">
        <div className="container-page">
          <h1 id="page-title" className="text-h1">
            {hero.title}
          </h1>
          <HelpSearch
            items={helpArticles.map((a) => ({
              slug: a.slug,
              title: a.title,
              summary: a.summary,
              topic: topicTitle[a.topic],
              text: `${a.body.join(" ")} ${helpTopics.find((t) => t.id === a.topic)?.body ?? ""}`,
            }))}
            label={hero.searchLabel}
            placeholder={hero.placeholder}
            empty={hero.empty}
          />
        </div>
      </section>

      <section aria-labelledby="topics-title" className="container-page section-y">
        <h2 id="topics-title" className="mb-8 text-h2">
          {topicsTitle}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {helpTopics.map((t) => {
            const Icon = icons[t.icon];
            const first = helpArticles.find((a) => a.topic === t.id);
            return (
              <li key={t.id}>
                <Link
                  href={first ? `/help/${first.slug}` : "/help"}
                  className="flex h-full gap-4 rounded-field border border-line bg-white p-5 transition-colors duration-(--dur-1) ease-out hover:border-blue-600 hover:bg-blue-50"
                >
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-tile bg-blue-50 text-blue-600">
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <span>
                    <span className="block text-[17px] font-semibold text-ink-900">{t.title}</span>
                    <span className="mt-1 block text-[15px] leading-snug text-ink-700">{t.body}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="safe-title" className="aurora bg-mist section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div>
            <h2 id="safe-title" className="max-w-[11em] text-h2">
              {safe.title}
            </h2>
            <p className="mt-5 text-lede text-ink-700">{safe.lede}</p>
          </div>
          <LinkRows rows={safe.rows} />
        </div>
      </section>

      <section aria-labelledby="faq-title" className="container-page section-y">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <div>
            <h2 id="faq-title" className="mb-6 text-h2">
              {faq.title}
            </h2>
            <Faq items={faq.items} />
          </div>
          <aside aria-labelledby="stuck-title" className="self-start rounded-convo bg-blue-50 p-6 md:p-8">
            <h2 id="stuck-title" className="text-h3">
              {stuck.title}
            </h2>
            <p className="mt-2 text-body text-ink-700">{stuck.body}</p>
            <ButtonLink href={stuck.action.href} className="mt-5">
              {stuck.action.label}
            </ButtonLink>
          </aside>
        </div>
      </section>
    </>
  );
}
