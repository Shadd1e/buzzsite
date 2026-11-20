"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { cn } from "@/lib/cn";

export interface RailGroup {
  id: string;
  label: string;
  items: Array<{ id: string; label: string }>;
}

/** Tracks which section is in view (scroll-spy). */
function useActive(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((e) => io.observe(e));
    // Above the first group (the page intro), nothing is current.
    const onScroll = () => {
      if (els[0] && els[0].getBoundingClientRect().top > window.innerHeight * 0.3) setActive(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);
  return active;
}

/**
 * Desktop: sticky left rail, grouped, with the current section marked.
 * Phones and tablets: a sticky bar of the five groups.
 */
export function DevRail({ groups }: { groups: RailGroup[] }) {
  const ids = useMemo(() => groups.flatMap((g) => [g.id, ...g.items.map((i) => i.id)]), [groups]);
  const active = useActive(ids);
  const activeGroup = groups.find((g) => g.id === active || g.items.some((i) => i.id === active))?.id;
  const barRef = useRef<HTMLUListElement>(null);

  // Keep the current group's chip visible in the phone bar.
  useEffect(() => {
    // Scroll only the bar (never the page, which would fight the user's scroll).
    const bar = barRef.current;
    const el = bar?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!bar || !el) return;
    bar.scrollTo({ left: el.offsetLeft - bar.offsetLeft - 8, behavior: "smooth" });
  }, [activeGroup]);

  return (
    <>
      {/* Phones and tablets */}
      <div className="glass sticky top-0 z-30 -mx-5 mb-2 border-b border-line md:-mx-10 lg:hidden">
        <nav aria-label="Component groups" className="flex items-center gap-2 px-5 py-2 md:px-10">
          <ul ref={barRef} className="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
            {groups.map((g) => (
              <li key={g.id} className="shrink-0">
                <a
                  href={`#${g.id}`}
                  aria-current={activeGroup === g.id ? "location" : undefined}
                  className="inline-flex min-h-11 items-center rounded-full px-3 text-[14px] font-medium whitespace-nowrap text-ink-700 aria-[current=location]:bg-ink-900 aria-[current=location]:text-white"
                >
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
          <TestDataRibbon placement="docked" />
        </nav>
      </div>

      {/* Desktop */}
      <nav aria-label="On this page" className="sticky top-6 hidden max-h-[calc(100dvh-48px)] overflow-y-auto pb-6 [scrollbar-width:thin] lg:block">
        <TestDataRibbon placement="docked" className="mb-6" />
        <ol className="flex flex-col gap-3">
          {groups.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                className={cn(
                  "block py-1 text-[13px] font-semibold",
                  activeGroup === g.id ? "text-ink-900" : "text-ink-500 hover:text-ink-900",
                )}
              >
                {g.label}
              </a>
              {/* Only the current group's sections are listed, so the rail fits the screen */}
              <ul className={cn("mt-1 flex-col", (activeGroup ?? groups[0].id) === g.id ? "flex" : "hidden")}>
                {g.items.map((i) => (
                  <li key={i.id}>
                    <a
                      href={`#${i.id}`}
                      aria-current={active === i.id ? "location" : undefined}
                      className="-ml-3 flex min-h-9 items-center rounded-tile px-3 text-[14px] text-ink-700 hover:bg-mist hover:text-ink-900 aria-[current=location]:bg-blue-50 aria-[current=location]:font-semibold aria-[current=location]:text-ink-900"
                    >
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <a href="#top" className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-[14px] font-medium text-blue-600 hover:text-blue-700">
          <ArrowUp aria-hidden="true" className="size-4" strokeWidth={1.8} />
          Back to top
        </a>
      </nav>
    </>
  );
}
