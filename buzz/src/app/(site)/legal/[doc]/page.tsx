import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileWarning } from "lucide-react";
import { legalDocs } from "@/content/legal";
import { cn } from "@/lib/cn";

/**
 * Legal template (DESIGN.md §9.12), 8 documents: pill switcher, draft banner,
 * sticky table of contents (stacks on mobile), body max 44em. Text pages stay
 * text: no decoration, no motion. Every section body is a placeholder until
 * legal review (PRODUCT.md truth rule 7).
 */
export function generateStaticParams() {
  return legalDocs.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  const d = legalDocs.find((x) => x.slug === doc);
  return d ? { title: `${d.title} (draft)`, description: d.summary, robots: { index: false } } : {};
}

const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Every valid page is prerendered by generateStaticParams, so this route
 * reads params directly: an unknown slug must answer with a real 404 status,
 * which a Suspense-streamed notFound() can't do. It opts out of the
 * instant-navigation check instead (dynamicParams isn't available with
 * Cache Components).
 */
export const instant = false;

export default async function LegalPage({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  const d = legalDocs.find((x) => x.slug === doc);
  if (!d) notFound();

  return (
    <div className="container-page pt-10 pb-18 md:pt-14 md:pb-26">
      <nav aria-label="Legal documents" className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0 [scrollbar-width:none]">
        <ul className="flex gap-2">
          {legalDocs.map((x) => (
            <li key={x.slug} className="shrink-0">
              <Link
                href={`/legal/${x.slug}`}
                aria-current={x.slug === d.slug ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-[14px] font-medium whitespace-nowrap",
                  x.slug === d.slug ? "bg-ink-900 text-white" : "border border-line-strong text-ink-900 hover:border-ink-900",
                )}
              >
                {x.short}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div role="note" className="mt-8 flex items-start gap-3 rounded-field border border-warn-700/20 bg-warn-50 p-4 text-warn-700">
        <FileWarning aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.8} />
        <div>
          <p className="text-[15px] font-semibold">Draft, pending legal review</p>
          <p className="mt-1 text-[14px] leading-relaxed">{d.draftNote}</p>
        </div>
      </div>

      {/* Title first, so phones see which document this is before the contents list */}
      <header className="mt-10 max-w-[44em] lg:ml-[calc(240px+4rem)]">
        <h1 className="text-[clamp(32px,4vw,48px)] leading-[1.1] font-light tracking-[-0.025em]">{d.title}</h1>
        <p className="mt-3 text-lede text-ink-700">{d.summary}</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[14px] font-semibold text-ink-900">On this page</p>
          <ol className="mt-3 flex flex-col border-l border-line">
            {d.sections.map((s) => (
              <li key={s}>
                <a href={`#${anchor(s)}`} className="-ml-px flex min-h-11 items-center border-l-2 border-transparent pl-4 text-[14px] text-ink-700 hover:border-blue-600 hover:text-ink-900">
                  {s}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-[44em]">
          {d.sections.map((s, i) => (
            <section key={s} id={anchor(s)} className={cn("scroll-mt-24 border-t border-line pt-8", i > 0 && "mt-8")}>
              <h2 className="text-h3">
                {i + 1}. {s}
              </h2>
              <p className="mt-3 text-body text-ink-500">[Draft text pending legal review]</p>
            </section>
          ))}
          {/* Room for the last anchor to reach the top */}
          <div aria-hidden="true" className="h-[40vh]" />
        </article>
      </div>
    </div>
  );
}
