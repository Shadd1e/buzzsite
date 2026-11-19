"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotionAfterMount } from "@/lib/useReducedMotionAfterMount";
import { cn } from "@/lib/cn";

/**
 * About's signature (DESIGN.md §9.7): problem → answer cards, each split in
 * two (problem in muted ink, Buzz's answer in blue). The moment: as each card
 * reaches the middle of the screen, the answer wipes in from the split line
 * and the problem recedes, one card at a time.
 *
 * The answer is never shown at low contrast: it is fully visible in the
 * server render and for cards already on screen at load. Only cards below the
 * fold are armed (clipped) after mount, then revealed. Reduced motion: no
 * arming, everything visible.
 */
export interface Pair {
  id: string;
  problem: string;
  answer: string;
  answerTitle: string;
}

function PairCard({ p }: { p: Pair }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotionAfterMount();
  const [armed, setArmed] = useState(false);
  const [seen, setSeen] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    // Arm only cards that start below the fold, so nothing visible flickers.
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.85) return;
    setArmed(true);
    // Reveal once the card's top has passed 55% of the viewport, however the
    // page got there (scrolling, an anchor jump, Page Down).
    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.55) {
        setSeen(true);
        window.removeEventListener("scroll", check);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [reduce]);

  const hidden = armed && !seen;

  return (
    <li ref={ref} className="grid overflow-hidden rounded-panel ring-1 ring-line md:grid-cols-2">
      <div className="bg-mist p-6 md:p-8">
        <p className="text-[14px] font-semibold text-ink-500">The problem</p>
        <p
          className={cn(
            "mt-3 text-[clamp(20px,1.8vw,24px)] leading-snug font-light transition-colors duration-(--dur-5) ease-out",
            hidden ? "text-ink-900" : "text-ink-700",
          )}
        >
          {p.problem}
        </p>
      </div>
      <div
        aria-hidden={hidden || undefined}
        className="bg-blue-600 p-6 text-white transition-[clip-path] duration-(--dur-5) ease-out md:p-8"
        style={{ clipPath: hidden ? "inset(0 100% 0 0)" : "inset(0 0 0 0)" }}
      >
        <p className="text-[14px] font-semibold">{p.answerTitle}</p>
        <p className="mt-3 text-[clamp(20px,1.8vw,24px)] leading-snug font-light">{p.answer}</p>
      </div>
    </li>
  );
}

export function FlipPairs({ items }: { items: readonly Pair[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((p) => (
        <PairCard key={p.id} p={p} />
      ))}
    </ul>
  );
}
