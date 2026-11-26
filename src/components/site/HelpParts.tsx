"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Accordion } from "radix-ui";
import { ChevronDown, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/cn";

/* ---------- Search over articles (§9.11 hero) ---------- */

export interface SearchItem {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  /** Article body and topic description, searched but not shown */
  text: string;
}

/* Words people use that the articles don't */
const synonyms: Record<string, string> = {
  refund: "dispute escrow",
  money: "escrow payment sunpay",
  pay: "escrow sunpay payment",
  code: "delivery code pickup",
  parcel: "track delivery logistics",
  number: "buzz id phone",
  download: "waitlist launch",
  business: "pro mode storefront",
  alert: "safety buzz alert emba",
};

export function HelpSearch({
  items,
  label,
  placeholder,
  empty,
}: {
  items: SearchItem[];
  label: string;
  placeholder: string;
  empty: string;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const words = q.toLowerCase().split(/[^a-z0-9@.]+/).filter(Boolean);
    if (words.length === 0) return [];
    return items
      .map((a) => {
        const head = `${a.title} ${a.summary}`.toLowerCase();
        const hay = `${head} ${a.topic} ${a.text}`.toLowerCase();
        const hit = (w: string) => {
          const stem = w.length > 5 ? w.slice(0, 5) : w;
          return hay.includes(stem) || (synonyms[w] ?? "").split(" ").some((s) => s && hay.includes(s));
        };
        if (!words.every(hit)) return null;
        // Title and summary matches rank first
        const score = words.filter((w) => head.includes(w.length > 5 ? w.slice(0, 5) : w)).length;
        return { a, score };
      })
      .filter((r): r is { a: SearchItem; score: number } => r !== null)
      .sort((x, y) => y.score - x.score)
      .map((r) => r.a);
  }, [items, q]);

  return (
    <div className="mx-auto mt-8 max-w-[640px]">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="help-q" className="sr-only">
          {label}
        </label>
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink-500" strokeWidth={1.8} />
        <input
          id="help-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-controls="help-results"
          className="h-14 w-full rounded-full border-[1.5px] border-line-strong bg-white pr-5 pl-13 text-[16px] text-ink-900 shadow-hair placeholder:text-ink-500 hover:border-ink-500 focus:border-blue-600"
        />
      </form>
      <div id="help-results" aria-live="polite">
        {q.trim() && (
          <div className="mt-3 overflow-hidden rounded-field border border-line bg-white text-left">
            {results.length === 0 ? (
              <p className="px-5 py-4 text-ui text-ink-700">{empty}</p>
            ) : (
              <ul className="divide-y divide-line">
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/help/${r.slug}`} className="block px-5 py-3.5 hover:bg-blue-50">
                      <span className="block text-[15px] font-semibold text-ink-900">{r.title}</span>
                      <span className="block text-[14px] text-ink-700">{r.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- FAQ accordion ---------- */

export function Faq({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
  return (
    <Accordion.Root type="single" collapsible className="divide-y divide-line border-y border-line">
      {items.map((it, i) => (
        <Accordion.Item key={it.q} value={`q${i}`}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left text-[17px] font-semibold text-ink-900">
              {it.q}
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-ink-500 transition-transform duration-(--dur-2) ease-out group-data-[state=open]:rotate-180"
                strokeWidth={1.8}
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden">
            <p className="max-w-[40em] pb-5 text-body text-ink-700">{it.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

/* ---------- Was this helpful? ---------- */

export function Helpful() {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-field bg-mist px-5 py-4">
      {answer ? (
        <p role="status" className="text-ui text-ink-900">
          {answer === "yes" ? "Thanks." : "Thanks. Still stuck?"}
          {answer === "no" && (
            <Link href="/contact" className="ml-2 font-semibold text-blue-700 underline underline-offset-4">
              Contact us
            </Link>
          )}
          <span className="mt-1 block text-[13px] text-ink-500">Test build: feedback isn&apos;t stored yet.</span>
        </p>
      ) : (
        <>
          <p className="text-ui font-semibold text-ink-900">Was this helpful?</p>
          <div className="flex gap-2">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAnswer(v)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-line-strong bg-white px-4 text-[15px] font-semibold text-ink-900 hover:border-ink-900",
                )}
              >
                {v === "yes" ? (
                  <ThumbsUp aria-hidden="true" className="size-4" strokeWidth={1.8} />
                ) : (
                  <ThumbsDown aria-hidden="true" className="size-4" strokeWidth={1.8} />
                )}
                {v === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
