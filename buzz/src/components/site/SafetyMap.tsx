"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useReducedMotionAfterMount } from "@/lib/useReducedMotionAfterMount";

/**
 * The Safety signature (DESIGN.md §9.6): an abstract street grid (not a real
 * map). A pin drops, a red radius ring expands, and phone dots inside the ring
 * light up with a mini alert while dots outside stay grey. Plays once when
 * scrolled into view; reduced motion shows the end state. Red is used here
 * because this IS the safety signal (§2.2).
 */
const CX = 400;
const CY = 240;
const R = 150;

// Phone positions (fixed, so server and client agree)
const DOTS: Array<[number, number]> = [
  [330, 190], [455, 175], [372, 300], [470, 285], [300, 255], [420, 345], [515, 225], [350, 125],
  [120, 90], [180, 380], [650, 110], [700, 360], [610, 430], [90, 300], [740, 220], [230, 60], [560, 60], [260, 440],
];
const inside = (x: number, y: number) => Math.hypot(x - CX, y - CY) < R - 6;

export function SafetyMap({ caption, insideLabel, outsideLabel }: { caption: string; insideLabel: string; outsideLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  // After-mount value avoids a hydration mismatch on the inline transitions
  const reduce = useReducedMotionAfterMount();
  const [stage, setStage] = useState(0); // 0 idle, 1 pin, 2 ring, 3 phones lit

  useEffect(() => {
    if (!seen) return;
    const ts = reduce
      ? [setTimeout(() => setStage(3), 0)]
      : [setTimeout(() => setStage(1), 100), setTimeout(() => setStage(2), 600), setTimeout(() => setStage(3), 1500)];
    return () => ts.forEach(clearTimeout);
  }, [seen, reduce]);

  const t = reduce ? "none" : undefined;

  return (
    <figure ref={ref} className="m-0">
      <div className="overflow-hidden rounded-panel bg-mist ring-1 ring-line">
        <svg viewBox="0 0 800 480" role="img" aria-label={`${caption} A red ring marks the alert area; phones inside it receive the alert, phones outside do not.`} className="block h-auto w-full">
          {/* Street grid */}
          <g stroke="var(--color-line-strong)" strokeWidth="10" strokeLinecap="round" fill="none">
            {[70, 160, 250, 340, 420].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y + (y % 3) * 6} />
            ))}
            {[80, 210, 330, 470, 590, 720].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x + (x % 4) * 5} y2="480" />
            ))}
            <path d="M0 470 C 220 380, 420 520, 800 300" strokeWidth="16" stroke="var(--color-line)" />
          </g>

          {/* Alert radius */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="var(--color-alert-600)"
            fillOpacity="0.1"
            stroke="var(--color-alert-600)"
            strokeWidth="3"
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: stage >= 2 ? "scale(1)" : "scale(0)",
              transition: t ?? "transform 900ms var(--ease-out)",
            }}
          />

          {/* One soft echo as the alert spreads (plays once) */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="var(--color-alert-600)"
            strokeWidth="2"
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: stage >= 2 ? "scale(1.22)" : "scale(0.9)",
              opacity: stage >= 2 && !reduce ? 0 : 0,
              animation: stage >= 2 && !reduce ? "map-echo 1400ms var(--ease-out) 500ms 1 both" : undefined,
            }}
          />

          {/* Phones: light up outward from the pin */}
          {DOTS.map(([x, y], i) => {
            const on = stage >= 3 && inside(x, y);
            const delay = Math.round((Math.hypot(x - CX, y - CY) / R) * 450);
            return (
              <g key={i}>
                <rect
                  x={x - 9}
                  y={y - 15}
                  width="18"
                  height="30"
                  rx="5"
                  style={{
                    fill: on ? "var(--color-alert-600)" : "var(--color-ink-300)",
                    transition: t ?? `fill 300ms var(--ease-out) ${delay}ms`,
                  }}
                />
                {on && (
                  <g
                    style={{
                      animation: reduce ? undefined : `badge-in 300ms var(--ease-out) ${delay + 150}ms both`,
                    }}
                  >
                    <rect x={x + 6} y={y - 30} width="22" height="16" rx="5" fill="var(--color-white)" stroke="var(--color-alert-600)" strokeWidth="2" />
                    <path d={`M${x + 17} ${y - 26} v5`} stroke="var(--color-alert-600)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx={x + 17} cy={y - 18} r="1.2" fill="var(--color-alert-600)" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Pin */}
          <g
            style={{
              transform: stage >= 1 ? "translateY(0)" : "translateY(-60px)",
              opacity: stage >= 1 ? 1 : 0,
              transition: t ?? "transform 550ms var(--ease-out), opacity 300ms var(--ease-out)",
            }}
          >
            <path
              d={`M${CX} ${CY} c -14 -20 -22 -30 -22 -42 a 22 22 0 0 1 44 0 c 0 12 -8 22 -22 42 z`}
              fill="var(--color-alert-600)"
              stroke="var(--color-white)"
              strokeWidth="3"
            />
            <circle cx={CX} cy={CY - 42} r="8" fill="var(--color-white)" />
          </g>
        </svg>
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-700">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-4 w-2.5 rounded-[3px] bg-alert-600" />
          {insideLabel}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-4 w-2.5 rounded-[3px] bg-ink-300" />
          {outsideLabel}
        </span>
        <span className="text-ink-500">{caption}</span>
      </figcaption>
    </figure>
  );
}
