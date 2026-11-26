"use client";

import { CircleCheck, Flag, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { PageHeader } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { formatDayTime, listRiderFlags } from "@/lib/data";
import { LoadError } from "./states";
import { FLAG_EXPLAINED } from "@/components/logistics/ops";
import { useRider } from "./RiderShell";

/**
 * Flags about this rider (DESIGN.md §10.2): off-route, other-company scan,
 * 48h silence, delivered without code, manual entry. Each says what it means
 * and how to avoid it. Reviews are done by the partner team (or the company).
 */
export function RiderFlags() {
  const { session } = useAccount();
  const me = useRider();
  const data = useLoad(() => listRiderFlags(session), [session.id]);
  const reviewer = me.kind === "individual" ? "the Buzz partner team" : (me.company ?? "your company");

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <PageHeader title="Flags" meta={`Things the system noticed about your scans. ${reviewer[0].toUpperCase()}${reviewer.slice(1)} reviews each one.`} />
      {data.state === "error" ? (
        <LoadError onRetry={data.reload} />
      ) : data.state === "loading" ? (
        <Skeleton className="h-40 w-full" />
      ) : data.data.length === 0 ? (
        <EmptyState icon={<Flag strokeWidth={1.7} />} title="No flags about you." body="Keep scanning at every stop and asking for delivery codes." />
      ) : (
        <ul className="divide-y divide-line rounded-field border border-line bg-white">
          {data.data.map((f) => {
            const x = FLAG_EXPLAINED[f.type];
            const open = f.status === "open";
            return (
              <li key={f.id} className="flex gap-3 px-5 py-4">
                {open ? (
                  <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warn-700" strokeWidth={1.8} />
                ) : (
                  <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ok-700" strokeWidth={1.8} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-ui font-semibold text-ink-900">{x.title}</p>
                    <p className={open ? "text-meta font-medium text-warn-700" : "text-meta text-ok-700"}>{open ? "Open" : "Reviewed"}</p>
                  </div>
                  <p className="mt-1 text-ui text-ink-900">{f.label}</p>
                  <p className="mt-1 text-ui text-ink-700">{x.what}</p>
                  <p className="mt-1.5 text-meta text-ink-500">
                    <span className="code-text">{f.trackingId}</span>, {formatDayTime(f.raisedAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
