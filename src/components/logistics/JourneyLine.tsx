"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { Bubble } from "@/components/chat";
import { useReducedMotionAfterMount } from "@/lib/useReducedMotionAfterMount";
import { cn } from "@/lib/cn";

/**
 * The Logistics home signature (DESIGN.md §10.1): an abstract route line
 * across city names. A parcel dot travels it, and each scan point lights up
 * with a system bubble ("Scanned in Benin · 14:20"). It plays once when
 * scrolled into view. City level only: it never suggests a live rider
 * position. Wide screens get a curved route; phones a vertical rail.
 * Reduced motion: every stop is lit and the parcel rests at the end.
 * Screen readers get the plain ordered list; the drawing is aria-hidden.
 */
type Stop = { city: string; text: string; time: string };

// Route geometry in a 1000×260 viewBox. Stops 0, 2, 4 are peaks with their
// bubble above; stops 1 and 3 are dips with their bubble hanging below. The
// line curves away from every bubble, so nothing sits on the route.
const H = 260;
const POINTS: Array<[number, number]> = [
  [40, 92],
  [270, 178],
  [500, 92],
  [730, 178],
  [960, 100],
];

function segment(i: number): string {
  const [x0, y0] = POINTS[i];
  const [x1, y1] = POINTS[i + 1];
  const h = (x1 - x0) / 2;
  return `M${x0} ${y0} C${x0 + h} ${y0} ${x1 - h} ${y1} ${x1} ${y1}`;
}

const LEG_S = 1.05; // travel time per leg
const REST_MS = 380; // pause at each scan point while its bubble pops
const POP = { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }; // §5.3

export function JourneyLine({ stops, caption, label }: { stops: ReadonlyArray<Stop>; caption: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.45 });
  const reduce = useReducedMotionAfterMount();
  const [played, setReached] = useState(-1);

  const legs = useRef<Array<SVGPathElement | null>>([]);
  const trails = useRef<Array<SVGPathElement | null>>([]);
  const parcel = useRef<SVGGElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const railFill = useRef<HTMLDivElement>(null);
  const railDot = useRef<HTMLSpanElement>(null);
  const railStops = useRef<Array<HTMLSpanElement | null>>([]);
  const progress = useRef(0);

  const last = stops.length - 1;
  // Reduced motion: everything lit, no sequence
  const reached = reduce ? last : played;

  useEffect(() => {
    // Draw the parcel at progress p (0 … last) on both layouts, without re-rendering
    const draw = (p: number) => {
      progress.current = p;
      const i = Math.min(Math.floor(p), last - 1);
      const frac = p - i;
      trails.current.forEach((t, j) => {
        const leg = legs.current[j];
        if (!t || !leg) return;
        const len = leg.getTotalLength();
        const f = j < i ? 1 : j === i ? frac : 0;
        t.style.strokeDasharray = `${len}`;
        t.style.strokeDashoffset = `${len * (1 - f)}`;
      });
      const leg = legs.current[i];
      if (leg && parcel.current) {
        const pt = leg.getPointAtLength(leg.getTotalLength() * frac);
        parcel.current.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      }
      // Phone rail: measured from the real stop dots (rows differ in height)
      const ys = railStops.current.map((el) => (el ? el.offsetTop + el.offsetHeight / 2 : 0));
      if (rail.current && ys.length) {
        const span = ys[last] - ys[0];
        const y = ys[i] + (ys[i + 1] - ys[i]) * frac - ys[0];
        rail.current.style.top = `${ys[0]}px`;
        rail.current.style.height = `${span}px`;
        if (railFill.current) railFill.current.style.height = `${y}px`;
        if (railDot.current) railDot.current.style.top = `${y}px`;
      }
    };
    const onResize = () => draw(progress.current);
    window.addEventListener("resize", onResize);

    if (reduce) {
      draw(last);
      return () => window.removeEventListener("resize", onResize);
    }
    draw(0);
    if (!seen) return () => window.removeEventListener("resize", onResize);

    let cancelled = false;
    let current: ReturnType<typeof animate> | null = null;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      setReached(0);
      await wait(REST_MS + 250);
      for (let i = 0; i < last && !cancelled; i++) {
        current = animate(i, i + 1, { duration: LEG_S, ease: [0.65, 0, 0.35, 1], onUpdate: draw });
        await current;
        if (cancelled) return;
        setReached(i + 1);
        await wait(REST_MS);
      }
    })();

    return () => {
      cancelled = true;
      current?.stop();
      window.removeEventListener("resize", onResize);
    };
  }, [seen, reduce, last]);

  const bubble = (s: Stop, i: number, tail: "start" | "end" | "top") => (
    <motion.div
      initial={false}
      animate={reached >= i ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: tail === "top" ? -12 : 12, scale: 0.86 }}
      transition={reduce ? { duration: 0 } : POP}
      style={{ transformOrigin: tail === "end" ? "100% 100%" : tail === "top" ? "0% 0%" : "0% 100%" }}
    >
      <Bubble variant="system" time={s.time} tail={tail}>
        {s.text}
      </Bubble>
    </motion.div>
  );

  return (
    <figure ref={ref} className="m-0">
      {/* Screen readers: the updates as plain text */}
      <ol aria-label={label} className="sr-only">
        {stops.map((s) => (
          <li key={s.city}>
            {s.text}, {s.time}
          </li>
        ))}
      </ol>

      <div aria-hidden="true" className="rounded-panel bg-blue-50 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Wide screens: the curved route */}
        <div className="relative hidden lg:block">
          <svg viewBox={`0 0 1000 ${H}`} className="block h-auto w-full overflow-visible">
            {POINTS.slice(0, -1).map((_, i) => (
              <path
                key={`leg${i}`}
                ref={(el) => {
                  legs.current[i] = el;
                }}
                d={segment(i)}
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1 9"
              />
            ))}
            {POINTS.slice(0, -1).map((_, i) => (
              <path
                key={`trail${i}`}
                ref={(el) => {
                  trails.current[i] = el;
                }}
                d={segment(i)}
                fill="none"
                stroke="var(--color-blue-600)"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ strokeDasharray: 400, strokeDashoffset: 400 }}
              />
            ))}
            {POINTS.map(([x, y], i) => (
              <circle
                key={`stop${i}`}
                cx={x}
                cy={y}
                r="8"
                strokeWidth="3"
                className="transition-[fill,stroke] duration-(--dur-2) ease-out"
                fill={reached >= i ? "var(--color-blue-600)" : "var(--color-white)"}
                stroke={reached >= i ? "var(--color-blue-600)" : "var(--color-line-strong)"}
              />
            ))}
            <g ref={parcel} transform={`translate(${POINTS[0][0]} ${POINTS[0][1]})`}>
              <circle r="17" fill="var(--color-sky-400)" opacity="0.25" />
              <circle r="10" fill="var(--color-sky-400)" stroke="var(--color-white)" strokeWidth="3" />
            </g>
          </svg>

          {stops.map((s, i) => {
            const [x, y] = POINTS[i];
            const below = i % 2 === 1;
            const end = i === last;
            const left = `${x / 10}%`;
            const top = `${(y / H) * 100}%`;
            return (
              <div key={s.city}>
                {/* Bubble: tail corner at the scan point */}
                <div
                  className="absolute w-[220px]"
                  style={{
                    left,
                    top,
                    marginLeft: end ? 16 : -16,
                    transform: `${end ? "translateX(-100%) " : ""}translateY(${below ? "22px" : "calc(-100% - 22px)"})`,
                  }}
                >
                  {bubble(s, i, below ? "top" : end ? "end" : "start")}
                </div>
                {/* City name on the other side of the line */}
                <span
                  className={cn(
                    "absolute -translate-x-1/2 text-[15px] font-semibold whitespace-nowrap transition-colors duration-(--dur-2) ease-out",
                    reached >= i ? "text-ink-900" : "text-ink-500",
                  )}
                  style={{ left, top, transform: `translate(-50%, ${below ? "calc(-100% - 18px)" : "16px"})` }}
                >
                  {s.city}
                </span>
              </div>
            );
          })}
        </div>

        {/* Phones and tablets: a vertical rail */}
        <div className="relative lg:hidden">
          <div ref={rail} className="absolute left-[11px] w-0.5 bg-line-strong">
            <div ref={railFill} className="absolute inset-x-0 top-0 h-0 bg-blue-600" />
            <span
              ref={railDot}
              className="absolute top-0 left-1/2 z-10 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-sky-400 ring-4 ring-sky-400/25"
            />
          </div>
          <ol className="relative flex flex-col gap-6">
            {stops.map((s, i) => (
              <li key={s.city} className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-4">
                <span
                  ref={(el) => {
                    railStops.current[i] = el;
                  }}
                  className={cn(
                    "relative z-[1] mt-[3px] size-[18px] justify-self-center rounded-full border-[3px] transition-colors duration-(--dur-2) ease-out",
                    reached >= i ? "border-blue-600 bg-blue-600" : "border-line-strong bg-white",
                  )}
                />
                <div className="flex flex-col gap-2">
                  <span className={cn("text-[15px] leading-6 font-semibold", reached >= i ? "text-ink-900" : "text-ink-500")}>
                    {s.city}
                  </span>
                  <div className="max-w-[300px]">{bubble(s, i, "top")}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <figcaption className="mt-4 text-small text-ink-500">{caption}</figcaption>
    </figure>
  );
}
