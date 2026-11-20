"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { cn } from "@/lib/cn";

/**
 * The App's signature (DESIGN.md §9.2): a sticky phone on the right while the
 * left column scrolls through the features; the screen swaps to match.
 * Below 1024px each feature shows its own phone under the text, so nothing
 * depends on sticky positioning on small screens.
 * The swap is a 400ms cross-fade (--dur-3); reduced motion makes it instant.
 */
export interface StageFeature {
  id: string;
  name: string;
  title: string;
  body: string;
  screen: ReactNode;
}

export function FeatureStage({ features }: { features: StageFeature[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-20">
      <div>
        {/* A small index (desktop): where you are, and a way to jump */}
        <nav
          aria-label="Features"
          className="glass sticky top-[84px] z-10 -mx-3 hidden rounded-full p-1.5 lg:inline-flex lg:gap-1"
        >
          {features.map((f, i) => (
            <button
              key={f.id}
              type="button"
              aria-current={active === i ? "true" : undefined}
              onClick={() =>
                refs.current[i]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
              className={cn(
                "min-h-11 rounded-full px-4 text-[15px] font-medium transition-colors duration-(--dur-2) ease-out",
                active === i
                  ? "bg-ink-900 text-white"
                  : "text-ink-700 hover:bg-mist hover:text-ink-900",
              )}
            >
              {f.name}
            </button>
          ))}
        </nav>
        <ol className="flex flex-col">
          {features.map((f, i) => (
            <li
              key={f.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              aria-current={active === i ? "step" : undefined}
              className="flex flex-col gap-8 py-12 lg:min-h-[60vh] lg:justify-center lg:py-0"
            >
              {/* Inactive steps recede by colour, not opacity, so they keep 4.5:1.
                No eyebrow label (§12): the heading names the feature itself. */}
              <div>
                <h3
                  className={cn(
                    "max-w-[14em] text-h2 transition-colors duration-(--dur-3) ease-out",
                    active !== i && "lg:text-ink-500",
                  )}
                >
                  {f.title}
                </h3>
                <p
                  className={cn(
                    "mt-5 max-w-[30em] text-body transition-colors duration-(--dur-3) ease-out",
                    active === i
                      ? "text-ink-700"
                      : "text-ink-700 lg:text-ink-500",
                  )}
                >
                  {f.body}
                </p>
              </div>
              <div className="flex justify-center lg:hidden">
                <PhoneFrame label={`${f.name} screen`}>{f.screen}</PhoneFrame>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-[calc(50vh-286px)]">
          <PhoneFrame label={`${features[active].name} screen`}>
            {features.map((f, i) => (
              <div
                key={f.id}
                aria-hidden={active !== i}
                className={cn(
                  "absolute inset-0 transition-[opacity,transform] duration-(--dur-3) ease-out",
                  active === i
                    ? "opacity-100"
                    : "pointer-events-none translate-y-3 opacity-0",
                )}
              >
                {f.screen}
              </div>
            ))}
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
