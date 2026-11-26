"use client";

import { useState } from "react";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Facts } from "@/components/logistics/ops";
import { formatNaira, getCompanyRates, quoteFromRates } from "@/lib/data";
import { cn } from "@/lib/cn";
import { AccessDenied, PageHeader, Panel } from "./ui";
import { usePortal, useLoad } from "./session";

const MODIFIER_LABEL: Record<string, string> = {
  fragile: "Fragile items",
  highValueOver500k: "High value (over ₦500,000)",
  oversize: "Oversize items",
};

/** Rates (DESIGN.md §10.2): per-km base, modifiers, the agreed Buzz % and an example calculator */
export function PortalRates() {
  const { session, can } = usePortal();
  const allowed = can("view_rates");
  const data = useLoad(() => (allowed ? getCompanyRates(session) : Promise.resolve(null)), [session.staffId, allowed]);
  const [km, setKm] = useState("25");
  const [mods, setMods] = useState<string[]>([]);
  if (!allowed) return <AccessDenied what="see rates" />;

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <PageHeader title="Rates" meta="Your per-km price. Buzz adds its agreed share on top for the buyer." />
      {data.state === "error" ? (
        <EmptyState title="Your rates didn't load." body="Check your connection, then refresh." />
      ) : data.state === "loading" || !data.data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        (() => {
          const r = data.data;
          const n = Math.min(Math.max(Number(km) || 0, 0), 5000);
          const q = quoteFromRates(r, n, mods);
          return (
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Panel title="Your rates" bodyClassName="px-5 py-2">
                <Facts
                  rows={[
                    ["Base per km", <span key="k" className="tabular-nums">{formatNaira(r.perKm)}</span>],
                    ...Object.entries(r.modifiers).map(
                      ([k, v]) => [MODIFIER_LABEL[k] ?? k, <span key={k} className="tabular-nums">+{v}%</span>] as [string, React.ReactNode],
                    ),
                    ["Buzz adds", <span key="b" className="tabular-nums">{r.buzzPercent}% (agreed with your company)</span>],
                    ["You're paid", "Straight after each delivery"],
                    ["Buzz share settles", r.settlement === "T+2" ? "Two working days later (T+2)" : "Straight away"],
                  ]}
                />
                <p className="py-3 text-meta text-ink-500">To change your rates, talk to your Buzz partner manager.</p>
              </Panel>
              <Panel title="Example">
                <div className="flex flex-col gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-[14px] font-semibold text-ink-900">Distance in km</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={5000}
                      value={km}
                      onChange={(e) => setKm(e.target.value)}
                      className="h-13 w-40 rounded-field border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink-900 tabular-nums hover:border-ink-500 focus:outline-3 focus:outline-offset-3 focus:outline-sky-400"
                    />
                  </label>
                  <fieldset className="flex flex-wrap gap-2">
                    <legend className="mb-2 text-[14px] font-semibold text-ink-900">Add-ons</legend>
                    {Object.keys(r.modifiers).map((m) => {
                      const on = mods.includes(m);
                      return (
                        <label
                          key={m}
                          className={cn(
                            "inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-[14px] font-medium",
                            "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sky-400",
                            on ? "bg-ink-900 text-white" : "border border-line-strong bg-white text-ink-900 hover:border-ink-900",
                          )}
                        >
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => setMods((x) => (on ? x.filter((y) => y !== m) : [...x, m]))} />
                          {MODIFIER_LABEL[m] ?? m}
                        </label>
                      );
                    })}
                  </fieldset>
                  <dl className="divide-y divide-line rounded-field border border-line" aria-live="polite">
                    <div className="flex justify-between px-4 py-3">
                      <dt className="text-ui text-ink-700">Your company earns</dt>
                      <dd className="text-[17px] font-semibold text-ink-900 tabular-nums">{formatNaira(q.earnings)}</dd>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <dt className="text-ui text-ink-700">Buzz share ({r.buzzPercent}%)</dt>
                      <dd className="text-ui text-ink-900 tabular-nums">{formatNaira(q.buzzShare)}</dd>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <dt className="text-ui text-ink-700">Buyer pays</dt>
                      <dd className="text-ui text-ink-900 tabular-nums">{formatNaira(q.buyerPays)}</dd>
                    </div>
                  </dl>
                </div>
              </Panel>
            </div>
          );
        })()
      )}
    </div>
  );
}
