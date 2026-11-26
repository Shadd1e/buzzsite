"use client";

import { useState } from "react";
import { Skeleton } from "@/components/Skeleton";
import { PageHeader, Panel } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { formatDate, formatNaira, getRiderRates, quoteFromRates } from "@/lib/data";
import { cn } from "@/lib/cn";
import { LoadError } from "./states";
import { Facts } from "@/components/logistics/ops";

const MODIFIER_LABEL: Record<string, string> = {
  fragile: "Fragile items",
  highValueOver500k: "High value (over ₦500,000)",
  oversize: "Oversize items",
};

/**
 * Rates (DESIGN.md §10.2): per-km base, modifiers, the agreed Buzz % and an
 * example calculator. Individual riders only.
 */
export function RiderRates() {
  const { session } = useAccount();
  const data = useLoad(() => getRiderRates(session), [session.id]);
  const [km, setKm] = useState("12");
  const [mods, setMods] = useState<string[]>([]);

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <PageHeader title="Rates" meta="What you charge per delivery. Buzz adds its share on top for the buyer." />
      {data.state === "error" ? (
        <LoadError onRetry={data.reload} />
      ) : data.state === "loading" ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        (() => {
          const r = data.data;
          const n = Math.min(Math.max(Number(km) || 0, 0), 2000);
          const q = quoteFromRates(r, n, mods);
          return (
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Panel title="Your rates" bodyClassName="px-5 py-2">
                <Facts
                  rows={[
                    ["Per km", <span key="k" className="tabular-nums">{formatNaira(r.perKm)}</span>],
                    ...Object.entries(r.modifiers).map(
                      ([k, v]) => [MODIFIER_LABEL[k] ?? k, <span key={k} className="tabular-nums">+{v}%</span>] as [string, React.ReactNode],
                    ),
                    ["Buzz adds", <span key="b" className="tabular-nums">{r.buzzPercent}% (adjustable per agreement)</span>],
                    ["Agreed", formatDate(r.agreedAt)],
                  ]}
                />
                <p className="py-3 text-meta text-ink-500">To change your rates, contact the Buzz partner team.</p>
              </Panel>

              <Panel title="Example">
                <div className="flex flex-col gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-[14px] font-semibold text-ink-900">Distance in km</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={2000}
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
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={on}
                            onChange={() => setMods((x) => (on ? x.filter((y) => y !== m) : [...x, m]))}
                          />
                          {MODIFIER_LABEL[m] ?? m}
                        </label>
                      );
                    })}
                  </fieldset>
                  <dl className="divide-y divide-line rounded-field border border-line" aria-live="polite">
                    <div className="flex justify-between px-4 py-3">
                      <dt className="text-ui text-ink-700">You earn</dt>
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
