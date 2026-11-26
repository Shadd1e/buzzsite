"use client";

import type { ReactNode } from "react";
import { CircleCheck, Layers, PenLine } from "lucide-react";
import { Chip } from "@/components/Chip";
import { Code } from "@/components/Code";
import { StatusPill } from "@/components/StatusPill";
import { cn } from "@/lib/cn";
import { formatDateTime, formatDayTime } from "@/lib/data/format";
import type { FlagType, Parcel } from "@/lib/data/types";

/** "Lagos (Yaba) to Lagos (Lekki)", the first and last stop */
export function routeText(route: string[]): string {
  return route.length > 1 ? `${route[0]} to ${route[route.length - 1]}` : (route[0] ?? "");
}

export function lastEvent(p: Parcel) {
  return p.timeline[p.timeline.length - 1];
}

/** Label and value rows inside a detail view */
export function Facts({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="divide-y divide-line">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
          <dt className="text-label text-ink-500">{k}</dt>
          <dd className="text-right text-ui text-ink-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A vertical timeline: newest first, with batch and hand-typed scans marked */
export function Timeline({ events }: { events: Array<{ label: string; city: string; at: string; viaBatch?: boolean; manualEntry?: boolean }> }) {
  const rows = [...events].reverse();
  return (
    <ol className="flex flex-col">
      {rows.map((e, i) => (
        <li key={`${e.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
          {i < rows.length - 1 && <span aria-hidden="true" className="absolute top-3 bottom-0 left-[5px] w-px bg-line" />}
          <span aria-hidden="true" className={cn("relative mt-1.5 size-[11px] shrink-0 rounded-full border-2", i === 0 ? "border-blue-600 bg-blue-600" : "border-line-strong bg-white")} />
          <div className="min-w-0">
            <p className="text-ui text-ink-900">{e.label}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-meta text-ink-500">
              <span>
                {e.city}, {formatDayTime(e.at)}
              </span>
              {e.viaBatch && (
                <span className="inline-flex items-center gap-1 text-blue-700">
                  <Layers aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                  Batch scan
                </span>
              )}
              {e.manualEntry && (
                <span className="inline-flex items-center gap-1 text-warn-700">
                  <PenLine aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                  Typed in by hand
                </span>
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Parcel detail for the rider (inside a drawer). Receiver: name and preferred
 * contact only. Codes are never shown, only whether they were verified.
 */
export function ParcelDetail({ parcel: p }: { parcel: Parcel }) {
  const last = lastEvent(p);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={p.status} />
        <span className="text-meta text-ink-500">
          Last scan {last.city}, {formatDateTime(last.at)}
        </span>
      </div>

      {p.nextStep && <p className="rounded-field bg-warn-50 px-4 py-3 text-ui text-warn-700">{p.nextStep}</p>}

      <section aria-label="Parcel">
        <Facts
          rows={[
            ["Tracking ID", <Code key="t" value={p.trackingId} label="Tracking ID" size="sm" />],
            ["Depot order", <span key="o" className="code-text">{p.orderId}</span>],
            ["Item", p.item],
            ["Route", routeText(p.route)],
            ["Distance", `${p.distanceKm} km`],
            ["Delivery", p.deliveryType === "home" ? "Home delivery" : "Pickup point"],
            ["Batch", p.batchId ? <span key="b" className="code-text">{p.batchId}</span> : "Not in a batch"],
          ]}
        />
      </section>

      <section aria-labelledby="receiver-title">
        <h3 id="receiver-title" className="text-section-title text-ink-900">
          Receiver
        </h3>
        <Facts
          rows={[
            ["Name", p.receiver.name],
            ["Prefers", p.receiver.preferredContact === "buzz" ? "A Buzz message" : "A phone call"],
            ["Check before handing over", p.receiver.verificationQuestion],
          ]}
        />
        {p.proof?.deliveryCodeVerified && (
          <p className="mt-2 flex items-center gap-1.5 text-ui text-ok-700">
            <CircleCheck aria-hidden="true" className="size-4" strokeWidth={1.8} />
            Delivery code verified
          </p>
        )}
      </section>

      <section aria-labelledby="history-title">
        <h3 id="history-title" className="mb-3 text-section-title text-ink-900">
          History
        </h3>
        <Timeline events={p.timeline} />
      </section>
    </div>
  );
}

/** What each flag means, in the rider's words */
export const FLAG_EXPLAINED: Record<FlagType, { title: string; what: string }> = {
  off_route: { title: "Off-route scan", what: "A scan happened far from the parcel's planned route. Keep to the route, or note why in the app." },
  other_company_scan: { title: "Scanned by another company", what: "Someone outside your account scanned this parcel. Tell the partner team if you handed it over." },
  silent_48h: { title: "No scan for 48 hours", what: "A parcel in transit went two days without a scan. Scan it at every stop." },
  no_delivery_code: { title: "Delivered without a code", what: "The parcel was marked delivered without the buyer's delivery code. Always ask for the code." },
  manual_entry: { title: "Typed in by hand", what: "The tracking ID was typed instead of scanned. Fine for a torn label, but scan whenever you can." },
};

/** Chip row for list filters */
export function FilterChips<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ key: K; label: string; count?: number }>;
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
      {options.map((o) => (
        <Chip key={o.key} selected={value === o.key} count={o.count} onClick={() => onChange(o.key)} className="shrink-0">
          {o.label}
        </Chip>
      ))}
    </div>
  );
}
