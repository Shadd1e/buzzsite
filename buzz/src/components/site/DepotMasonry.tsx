"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Home, MapPin, Play, Search, Shirt, Wrench } from "lucide-react";
import { Chip } from "@/components/Chip";
import { formatNaira } from "@/lib/data/format";
import { cn } from "@/lib/cn";
import type { DepotCategory, SampleListing } from "@/content/depot";

/**
 * Depot hero search + masonry of sample listing cards (DESIGN.md §9.4).
 * Listing cards are photo-led with no border (§8.2). The orchestrated
 * moment: the masonry assembles column by column on load (CSS, staggered by
 * column; off with reduced motion).
 *
 * Columns are built explicitly (2 / 3 / 4 by breakpoint) so the stagger can
 * follow real columns. Only one layout is displayed at a time.
 */
/* One filter state shared by the hero search and the listings below it. */
type Filter = { cat: "all" | DepotCategory; q: string };
let filter: Filter = { cat: "all", q: "" };
const listeners = new Set<() => void>();
const store = {
  get: () => filter,
  set(next: Partial<Filter>) {
    filter = { ...filter, ...next };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
const SERVER_FILTER: Filter = { cat: "all", q: "" };
function useFilter() {
  return useSyncExternalStore(store.subscribe, store.get, () => SERVER_FILTER);
}

/* Words people use for each category, so "house" or "plumber" finds results */
const categoryWords: Record<DepotCategory, string> = {
  products: "products buy shop goods fashion",
  housing: "housing house home flat apartment room rent landlord",
  handymen: "handymen handyman service repair repairs fix plumber plumbing electrician",
};

/** Every query word must match the start of a word in the listing (so stems work). */
export function matches(l: SampleListing, query: string) {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length === 0) return true;
  const hay = `${l.title} ${l.seller} ${l.area} ${categoryWords[l.category]}`.toLowerCase().split(/[^a-z0-9]+/);
  return words.every((w) => {
    const stem = w.length > 5 ? w.slice(0, 5) : w;
    return hay.some((h) => h.startsWith(stem));
  });
}

const categoryIcon = { products: Shirt, housing: Home, handymen: Wrench } as const;

const ratioClass = { tall: "aspect-[3/4]", square: "aspect-square", wide: "aspect-[4/3]" } as const;

function ListingCard({ l, col }: { l: SampleListing; col: number }) {
  return (
    <article className="assemble group" style={{ "--col": col } as React.CSSProperties}>
      <div className={cn("relative grid place-items-center overflow-hidden rounded-card bg-blue-50 text-blue-600", ratioClass[l.ratio])}>
        {l.video ? (
          <span className="absolute top-3 right-3 text-[12px] text-ink-700">[video]</span>
        ) : (
          (() => {
            const Icon = categoryIcon[l.category];
            return (
              <span className="flex flex-col items-center gap-2 text-[12px] text-ink-700">
                <Icon aria-hidden="true" className="size-9 text-blue-600" strokeWidth={1.3} />
                [photo]
              </span>
            );
          })()
        )}
        {l.live && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[12px] font-semibold text-white">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-white motion-safe:animate-live-dot" />
            Live
          </span>
        )}
        {l.video && (
          <>
            <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
              <span className="grid size-12 place-items-center rounded-full bg-navy/70 text-white">
                <Play className="size-5 translate-x-0.5 fill-current" strokeWidth={0} />
              </span>
            </span>
            <span className="absolute inset-x-3 bottom-3 inline-flex h-9 items-center justify-center rounded-full bg-sky-400 text-[13px] font-semibold text-ink-900">
              Shop now
            </span>
          </>
        )}
      </div>
      <div className="px-1 pt-3 pb-1">
        <p className="text-[16px] font-semibold text-ink-900 tabular-nums">
          {formatNaira(l.price)}
          {l.unit && <span className="ml-1 text-[13px] font-normal text-ink-500">{l.unit}</span>}
        </p>
        <h3 className="mt-0.5 text-[15px] text-ink-900">{l.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-ink-500">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.8} />
          <span className="truncate">
            {l.seller}, {l.area}
          </span>
        </p>
      </div>
    </article>
  );
}

function Columns({ items, count, className }: { items: SampleListing[]; count: number; className?: string }) {
  const cols = Array.from({ length: count }, (_, c) => items.filter((_, i) => i % count === c));
  return (
    <div className={cn("gap-4 md:gap-5", className)} style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {cols.map((col, c) => (
        <div key={c} className="flex flex-col gap-6">
          {col.map((l) => (
            <ListingCard key={l.id} l={l} col={c} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DepotSearch({
  label,
  placeholder,
  chips,
  note,
}: {
  label: string;
  placeholder: string;
  chips: ReadonlyArray<{ id: string; label: string }>;
  note: string;
}) {
  const f = useFilter();
  return (
    <div className="mt-8">
      <form
        role="search"
        className="relative max-w-[560px]"
        onSubmit={(e) => {
          e.preventDefault();
          document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <label htmlFor="depot-q" className="sr-only">
          {label}
        </label>
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink-500" strokeWidth={1.8} />
        <input
          id="depot-q"
          type="search"
          value={f.q}
          onChange={(e) => store.set({ q: e.target.value })}
          placeholder={placeholder}
          aria-controls="listings"
          className="h-14 w-full rounded-full border-[1.5px] border-line-strong bg-white pr-5 pl-13 text-[16px] text-ink-900 shadow-hair placeholder:text-ink-500 hover:border-ink-500 focus:border-blue-600"
        />
      </form>
      <div role="group" aria-label="Category" className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <Chip
            key={c.id}
            selected={f.cat === c.id}
            onClick={() => store.set({ cat: c.id as Filter["cat"] })}
          >
            {c.label}
          </Chip>
        ))}
      </div>
      <p className="mt-3 text-[14px] text-ink-500">{note}</p>
    </div>
  );
}

export function DepotMasonry({ items, empty }: { items: readonly SampleListing[]; empty: string }) {
  const { cat, q } = useFilter();

  const shown = useMemo(() => {
    return items.filter((l) => (cat === "all" || l.category === cat) && matches(l, q));
  }, [items, cat, q]);

  return (
    <div>
      <p role="status" aria-live="polite" className="sr-only">
        {shown.length === 1 ? "1 sample listing shown" : `${shown.length} sample listings shown`}
      </p>
      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-field border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="text-ui text-ink-700">{empty}</p>
          <button
            type="button"
            onClick={() => store.set({ cat: "all", q: "" })}
            className="min-h-11 rounded-full border-[1.5px] border-line-strong px-5 text-[15px] font-semibold text-ink-900 hover:border-ink-900"
          >
            Show all samples
          </button>
        </div>
      ) : (
        <>
          <Columns items={shown} count={2} className="grid md:hidden" />
          <Columns items={shown} count={3} className="hidden md:grid lg:hidden" />
          <Columns items={shown} count={4} className="hidden lg:grid" />
        </>
      )}
    </div>
  );
}
