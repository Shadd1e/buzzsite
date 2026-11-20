import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Helpful } from "@/components/site/HelpParts";
import { helpArticles, helpTopics } from "@/content/help";

/**
 * Help article template (DESIGN.md §9.11): breadcrumb, title, last updated,
 * body (max 68ch), "Was this helpful?" and related articles. Text pages stay
 * text: no decoration, no motion.
 */
export function generateStaticParams() {
  return helpArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/help/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = helpArticles.find((x) => x.slug === slug);
  return a ? { title: `${a.title} · Help`, description: a.summary } : {};
}

/**
 * Every valid page is prerendered by generateStaticParams, so this route
 * reads params directly: an unknown slug must answer with a real 404 status,
 * which a Suspense-streamed notFound() can't do. It opts out of the
 * instant-navigation check instead (dynamicParams isn't available with
 * Cache Components).
 */
export const instant = false;

export default async function HelpArticlePage({ params }: PageProps<"/help/[slug]">) {
  const { slug } = await params;
  const article = helpArticles.find((a) => a.slug === slug);
  if (!article) notFound();
  const topic = helpTopics.find((t) => t.id === article.topic);
  const related = article.related.map((s) => helpArticles.find((a) => a.slug === s)).filter((a) => !!a);

  // Group consecutive "- " lines into one list
  const blocks: Array<{ type: "p"; text: string } | { type: "ul"; items: string[] }> = [];
  for (const line of article.body) {
    if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.type === "ul") last.items.push(line.slice(2));
      else blocks.push({ type: "ul", items: [line.slice(2)] });
    } else blocks.push({ type: "p", text: line });
  }

  return (
    <article className="container-page pt-10 pb-18 md:pt-14 md:pb-26">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-[14px] text-ink-500">
          <li>
            <Link href="/help" className="inline-flex min-h-11 items-center hover:text-ink-900 hover:underline">
              Help Centre
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" strokeWidth={1.8} />
          </li>
          <li>{topic?.title}</li>
        </ol>
      </nav>

      <div className="mt-4 max-w-[68ch]">
        <h1 className="text-[clamp(32px,4vw,48px)] leading-[1.1] font-light tracking-[-0.025em]">{article.title}</h1>
        <p className="mt-3 text-[14px] text-ink-500">Last updated {article.updated}</p>

        <div className="mt-8 flex flex-col gap-5 text-body text-ink-700">
          {blocks.map((b, i) =>
            b.type === "p" ? (
              <p key={i} className={b.text.startsWith("[") ? "text-ink-500" : undefined}>
                {b.text}
              </p>
            ) : (
              <ul key={i} className="flex list-disc flex-col gap-2 pl-6 marker:text-blue-600">
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            ),
          )}
        </div>

        <div className="mt-10">
          <Helpful />
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-12">
            <h2 id="related-title" className="text-h3">
              Related articles
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/help/${r.slug}`} className="block py-4 hover:bg-blue-50">
                    <span className="block text-[16px] font-semibold text-blue-700">{r.title}</span>
                    <span className="block text-[15px] text-ink-700">{r.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
