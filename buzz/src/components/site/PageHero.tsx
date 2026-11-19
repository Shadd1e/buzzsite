import type { ReactNode } from "react";
import { ButtonLink } from "@/components/Button";
import { Convo, type ConvoMessage } from "@/components/chat";
import { cn } from "@/lib/cn";

/**
 * Inner marketing page hero (DESIGN.md §9: "hero conversation → …"):
 * headline, lede and CTA on the left, the page's own conversation on the
 * right, over a live gradient. Pass `aside` instead of `messages` when the
 * hero shows something else (e.g. an alert card or a Pro ID card).
 */
export function PageHero({
  title,
  lede,
  cta,
  messages,
  convoLabel,
  aside,
  tone = "light",
  children,
  className,
}: {
  title: string;
  lede: string;
  cta?: { label: string; href: string };
  messages?: ConvoMessage[];
  convoLabel?: string;
  aside?: ReactNode;
  tone?: "light" | "navy";
  /** Extra content under the CTA (e.g. a search field) */
  children?: ReactNode;
  className?: string;
}) {
  const navy = tone === "navy";
  return (
    <section
      aria-labelledby="page-title"
      className={cn(
        "aurora",
        navy ? "aurora-navy bg-navy" : "bg-white",
        "pt-10 pb-18 md:pt-16 md:pb-26",
        className,
      )}
    >
      <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <h1 id="page-title" className={cn("max-w-[13em] text-h1", navy && "text-white")}>
            {title}
          </h1>
          <p className={cn("mt-6 max-w-[30em] text-lede", navy ? "text-ink-300" : "text-ink-700")}>{lede}</p>
          {cta && (
            <div className="mt-8">
              <ButtonLink href={cta.href} variant={navy ? "sky" : "solid"} size="lg">
                {cta.label}
              </ButtonLink>
            </div>
          )}
          {children}
        </div>
        <div className="w-full max-w-[520px] justify-self-center lg:justify-self-end">
          {aside ??
            (messages && (
              <Convo
                messages={messages}
                start="mount"
                delay={300}
                label={convoLabel}
                className={navy ? "bg-white/95" : "bg-blue-50/90 backdrop-blur-sm"}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
