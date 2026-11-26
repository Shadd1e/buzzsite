"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { MessageStatus } from "@/lib/data/types";
import { cn } from "@/lib/cn";
import type { Sender } from "./Avatar";
import { Bubble, type BubbleVariant, type ChatTheme } from "./Bubble";
import { Typing } from "./Typing";

/**
 * DESIGN.md §5.3: bubbles pop in one after another, like messages arriving.
 * opacity 0 → 1, translateY(12px) scale(.86) → none, 550ms, --ease-out,
 * staggered 800ms, transform origin at the tail corner. A typing indicator can
 * come before an incoming bubble. No overshoot or bounce.
 *
 * Every bubble is laid out from the start (invisible until its turn), so the
 * panel never jumps in height. With reduced motion everything shows at once.
 */
export interface ConvoMessage {
  variant: BubbleVariant;
  sender?: Sender;
  showName?: boolean;
  time?: string;
  status?: MessageStatus;
  /** Show "… is typing" before this incoming bubble */
  typingFirst?: boolean;
  content: ReactNode;
}

const STAGGER_MS = 800;
const TYPING_MS = 1100;
const POP = { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }; // --dur-4, --ease-out

type Phase = "hidden" | "typing" | "shown";

export function Convo({
  messages,
  start = "inView",
  panel = true,
  glass = false,
  label = "Example conversation",
  theme = "light",
  delay = 150,
  className,
}: {
  messages: ConvoMessage[];
  /** Begin on mount, or when the convo scrolls into view */
  start?: "mount" | "inView";
  /** Wrap in the 32px --blue-50 convo panel. Off for bubbles over a photo. */
  panel?: boolean;
  /** Incoming bubbles in glass (over images) */
  glass?: boolean;
  label?: string;
  /** Buzz Web dark theme (§2.2) */
  theme?: ChatTheme;
  /** ms before the first bubble, e.g. to follow a hero headline rise */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const go = start === "mount" || inView;

  const [phases, setPhases] = useState<Phase[]>(() => messages.map(() => "hidden"));

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Reduced motion: show everything at once. This runs after hydration on
    // purpose. Branching on `reduce` during render would differ from the
    // server HTML, and React leaves mismatched attributes unpatched (the
    // bubbles would stay at opacity 0).
    if (reduce) {
      timers.push(setTimeout(() => setPhases(messages.map(() => "shown")), 0));
      return () => timers.forEach(clearTimeout);
    }
    if (!go) return;
    const set = (i: number, p: Phase) =>
      setPhases((prev) => prev.map((old, j) => (j === i ? p : old)));

    let t = delay;
    messages.forEach((m, i) => {
      if (m.typingFirst && m.variant !== "out" && m.sender) {
        timers.push(setTimeout(() => set(i, "typing"), t));
        t += TYPING_MS;
      }
      timers.push(setTimeout(() => set(i, "shown"), t));
      t += STAGGER_MS;
    });
    return () => timers.forEach(clearTimeout);
  }, [go, reduce, messages, delay]);

  const onTint = panel && !glass && theme !== "dark";

  return (
    <div
      ref={ref}
      role="log"
      // An illustrative convo: don't announce each bubble as it pops in.
      aria-live="off"
      aria-label={label}
      className={cn(
        "flex flex-col gap-2.5",
        panel && "rounded-convo p-4 sm:p-6",
        panel && (theme === "dark" ? "bg-dark-bg" : "bg-blue-50"),
        className,
      )}
    >
      {messages.map((m, i) => {
        const phase = phases[i];
        const origin = m.variant === "out" ? "100% 100%" : "0% 100%";
        return (
          <div key={i} className="relative">
            <motion.div
              initial={false}
              animate={
                phase === "shown"
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 12, scale: 0.86 }
              }
              transition={reduce ? { duration: 0 } : POP}
              style={{ transformOrigin: origin }}
              aria-hidden={phase !== "shown" || undefined}
            >
              <Bubble
                variant={m.variant}
                sender={m.sender}
                showName={m.showName}
                time={m.time}
                status={m.status}
                glass={glass && (m.variant === "in" || m.variant === "system")}
                onTint={onTint}
                theme={theme}
              >
                {m.content}
              </Bubble>
            </motion.div>
            {m.sender && m.typingFirst && (
              <motion.div
                className="pointer-events-none absolute bottom-0 left-0"
                initial={false}
                animate={phase === "typing" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.86 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "0% 100%" }}
                aria-hidden={phase !== "typing" || undefined}
              >
                <Typing sender={m.sender} onTint={onTint} glass={glass} theme={theme} />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
