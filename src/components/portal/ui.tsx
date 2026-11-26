"use client";

import { useState, type ReactNode } from "react";
import { Ban, CircleCheck, Clock, Lock, Snowflake, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ButtonLink } from "@/components/Button";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/data/format";
import type { RiderDay, RiderStatus, Stop, StopStatus } from "@/lib/data/types";

/* ---------- page header ---------- */

export function PageHeader({ title, meta, actions }: { title: string; meta?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-page-title text-ink-900">{title}</h1>
        {meta && <p className="mt-1 text-ui text-ink-500">{meta}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** A white panel with an optional heading row. Portal cards: 14px, 1px border, no shadow (§8.2). */
export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-field border border-line bg-white", className)} aria-label={title}>
      {title && (
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-5">
          <h2 className="text-section-title text-ink-900">{title}</h2>
          {action}
        </div>
      )}
      <div className={bodyClassName ?? "p-5"}>{children}</div>
    </section>
  );
}

/* ---------- stat strip ---------- */

/** Key numbers in one bordered strip, divided by hairlines, not a row of cards. */
export function StatStrip({ items }: { items: Array<{ label: string; value: ReactNode; note?: ReactNode }> }) {
  return (
    <dl className="grid grid-cols-2 overflow-hidden max-sm:[&>*:last-child:nth-child(odd)]:col-span-2 rounded-field border border-line bg-white sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
      {items.map((it) => (
        <div key={it.label} className="-mt-px -ml-px border-t border-l border-line px-5 py-4">
          <dt className="text-label text-ink-500">{it.label}</dt>
          <dd className="mt-1.5 text-stat text-ink-900 tabular-nums">{it.value}</dd>
          {it.note && <dd className="mt-1 text-meta text-ink-500">{it.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/* ---------- rider status ---------- */

const riderStatus: Record<RiderStatus, { label: string; cls: string; icon: typeof Ban }> = {
  active: { label: "Active", cls: "bg-ok-50 text-ok-700 border-ok-600/25", icon: CircleCheck },
  pending_verification: { label: "Pending verification", cls: "bg-warn-50 text-warn-700 border-warn-700/15", icon: Clock },
  deactivated: { label: "Deactivated", cls: "bg-mist text-ink-700 border-line", icon: Ban },
  frozen: { label: "Frozen by Buzz", cls: "bg-blue-50 text-blue-700 border-blue-100", icon: Snowflake },
};

export function RiderStatusPill({ status, size = "md" }: { status: RiderStatus; size?: "sm" | "md" }) {
  const s = riderStatus[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "h-6 px-2.5 text-[12px]" : "h-7 px-3 text-[13px]",
        s.cls,
      )}
    >
      <s.icon aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
      {s.label}
    </span>
  );
}

/* ---------- run line (the portal's signature) ---------- */

export const stopStatusLabel: Record<StopStatus, string> = {
  done: "Done",
  failed: "Failed attempt",
  current: "On the way",
  upcoming: "Upcoming",
};

function Dot({ status, size }: { status: StopStatus; size: "sm" | "md" }) {
  const box = size === "sm" ? "size-3" : "size-4";
  if (status === "current") {
    return (
      <span className={cn("relative grid place-items-center", box)}>
        <span className="absolute inset-0 rounded-full bg-blue-600/25 motion-safe:animate-live-dot" />
        <span className={cn("rounded-full bg-blue-600 ring-2 ring-white", size === "sm" ? "size-2" : "size-2.5")} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "block rounded-full",
        box,
        status === "done" && "bg-blue-600",
        status === "failed" && "border-[2.5px] border-chart-failed bg-warn-50",
        status === "upcoming" && "border-[1.5px] border-line-strong bg-white",
      )}
    />
  );
}

/**
 * A rider's day as dots on a line: filled = done, amber ring = failed attempt,
 * pulsing = on the way, hollow = upcoming. The line fills up to the current
 * stop. The text summary carries the same facts for screen readers.
 */
export function RunLine({ stops, size = "sm", className }: { stops: Stop[]; size?: "sm" | "md"; className?: string }) {
  const done = stops.filter((s) => s.status === "done" || s.status === "failed").length;
  const failed = stops.filter((s) => s.status === "failed").length;
  const pct = stops.length > 1 ? (Math.min(done, stops.length - 1) / (stops.length - 1)) * 100 : 0;
  return (
    <div className={cn("relative flex items-center", className)}>
      <span className="sr-only">
        {done} of {stops.length} stops done{failed ? `, ${failed} failed attempt${failed > 1 ? "s" : ""}` : ""}
      </span>
      <div aria-hidden="true" className="absolute inset-x-1.5 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-line">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
      <ol aria-hidden="true" className="relative flex w-full items-center justify-between">
        {stops.map((s) => (
          <li key={s.id} title={`${s.seq}. ${s.place}: ${stopStatusLabel[s.status]}`}>
            <Dot status={s.status} size={size} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function StopStatusTag({ status }: { status: StopStatus }) {
  const cls: Record<StopStatus, string> = {
    done: "text-ok-700",
    failed: "text-warn-700",
    current: "text-blue-700",
    upcoming: "text-ink-500",
  };
  const Icon = status === "done" ? CircleCheck : status === "failed" ? TriangleAlert : null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[13px] font-medium whitespace-nowrap", cls[status])}>
      {Icon ? <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.9} /> : <Dot status={status} size="sm" />}
      {stopStatusLabel[status]}
    </span>
  );
}

/* ---------- daily bars ---------- */

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Africa/Lagos" });

/**
 * Delivered (blue) stacked under failed attempts (amber), one bar per day.
 * Hover or focus a bar for its numbers; a table carries the same data for
 * screen readers. One axis, 4px rounded tops, 2px gap between segments.
 */
export function DailyBars({ days, height = 160, label }: { days: RiderDay[]; height?: number; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.delivered + d.failed));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step);
  const active = hover !== null ? days[hover] : null;

  if (days.length === 0) {
    return <p className="py-8 text-center text-ui text-ink-500">No deliveries in this period yet.</p>;
  }

  return (
    <figure>
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-meta text-ink-700">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-blue-600" /> Delivered
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-chart-failed" /> Failed attempts
        </span>
        <span aria-live="polite" className="ml-auto min-h-[1.4em] text-ink-900 tabular-nums">
          {active
            ? `${formatDate(active.date)}: ${active.delivered} delivered, ${active.failed} failed`
            : ""}
        </span>
      </div>
      <div className="relative flex gap-2" style={{ height }} aria-hidden="true">
        {/* y axis */}
        <div className="relative w-6 shrink-0 text-right text-[11px] text-ink-500 tabular-nums">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `calc(${(t / top) * 100}% - 0px)` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <span key={t} className="absolute inset-x-0 h-px bg-line" style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[3px] sm:gap-1.5">
            {days.map((d, i) => {
              const total = d.delivered + d.failed;
              return (
                <div
                  key={d.date}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div
                    className={cn("mx-auto flex w-full max-w-7 flex-col justify-end gap-[2px] transition-opacity duration-(--dur-1)", hover !== null && hover !== i && "opacity-45")}
                    style={{ height: `${(total / top) * 100}%` }}
                  >
                    {d.failed > 0 && (
                      <span className="block rounded-t-[4px] bg-chart-failed" style={{ flexGrow: d.failed, minHeight: 2 }} />
                    )}
                    {d.delivered > 0 && (
                      <span
                        className={cn("block bg-blue-600", d.failed === 0 && "rounded-t-[4px]")}
                        style={{ flexGrow: d.delivered, minHeight: 2 }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* x labels: every day for a week, every other day for two */}
      <div className="mt-2 flex gap-2" aria-hidden="true">
        <span className="w-6 shrink-0" />
        <div className="flex flex-1 gap-[3px] sm:gap-1.5">
          {days.map((d, i) => (
            <span key={d.date} className="flex-1 text-center text-[11px] text-ink-500">
              {days.length <= 7 || i % 2 === days.length % 2 ? weekday.format(new Date(`${d.date}T12:00:00+01:00`)) : ""}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="sr-only">{label}</figcaption>
      {/* Tables ignore height, so sr-only goes on a wrapper or it adds page scroll */}
      <div className="sr-only">
      <table>
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Delivered</th>
            <th scope="col">Failed attempts</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <th scope="row">{formatDate(d.date)}</th>
              <td>{d.delivered}</td>
              <td>{d.failed}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

function niceStep(max: number) {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/* ---------- states ---------- */

export function AccessDenied({ what }: { what: string }) {
  return (
    <EmptyState
      icon={<Lock strokeWidth={1.7} />}
      title={`Only super admins can ${what}.`}
      body="Ask your company's super admin if you need this."
      action={
        <ButtonLink href="/logistics/portal" variant="outline" size="sm">
          Go to overview
        </ButtonLink>
      }
    />
  );
}
