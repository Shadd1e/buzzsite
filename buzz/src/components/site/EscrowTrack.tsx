"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotionAfterMount } from "@/lib/useReducedMotionAfterMount";
import { cn } from "@/lib/cn";

/**
 * The Payments signature (DESIGN.md §9.5): a rail with 4 numbered stops (a
 * real sequence, so numbers are correct). A ₦ token travels the rail as the
 * section scrolls through the viewport, and each stop lights up as the token
 * reaches it. Horizontal from 768px, vertical on phones.
 * Reduced motion: every stop is lit and the token rests at the end.
 */
function Token({ style }: { style: React.CSSProperties }) {
  return (
    <span
      className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sky-400 text-[15px] font-bold text-ink-900 shadow-float"
      style={style}
    >
      ₦
    </span>
  );
}

export function EscrowTrack({
  stops,
  note,
}: {
  stops: ReadonlyArray<{ title: string; body: string }>;
  note: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  // After-mount value: the server renders the start state, then this flips.
  const reduce = useReducedMotionAfterMount();

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the rail's top reaches 75% of the viewport; 1 when its bottom reaches 55%
      const span = Math.max(r.height + vh * 0.2, 1);
      const p = (vh * 0.75 - r.top) / span;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce]);

  const p = reduce ? 1 : progress;
  const last = stops.length - 1;
  const lit = (i: number) => p >= i / last - 0.001;
  const pct = `${p * 100}%`;

  return (
    <div ref={ref}>
      <div className="relative">
        {/* Phones: vertical rail through the markers' centres (left 20px) */}
        <div aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-0.5 rounded-full bg-line md:hidden">
          <div className="absolute inset-x-0 top-0 rounded-full bg-blue-600" style={{ height: pct }} />
          <Token style={{ top: pct, left: "50%" }} />
        </div>
        {/* Tablet and up: horizontal rail between the first and last markers */}
        <div aria-hidden="true" className="absolute top-5 right-[12.5%] left-[12.5%] hidden h-0.5 rounded-full bg-line md:block">
          <div className="absolute inset-y-0 left-0 rounded-full bg-blue-600" style={{ width: pct }} />
          <Token style={{ left: pct, top: "50%" }} />
        </div>

        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          {stops.map((s, i) => (
            <li key={s.title} className="flex gap-5 md:flex-col md:items-center md:gap-4 md:text-center">
              <span
                className={cn(
                  "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 text-[15px] font-semibold tabular-nums transition-colors duration-(--dur-2) ease-out",
                  lit(i) ? "border-blue-600 bg-blue-600 text-white" : "border-line-strong bg-white text-ink-500",
                )}
              >
                {i + 1}
              </span>
              <div className="pt-1.5 md:pt-0">
                <h3 className="text-h3">{s.title}</h3>
                <p className="mt-1.5 max-w-[18em] text-[16px] leading-relaxed text-ink-700">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-12 rounded-field bg-blue-50 px-5 py-4 text-[16px] font-medium text-ink-900 md:text-center">{note}</p>
    </div>
  );
}
