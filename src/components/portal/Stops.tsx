"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, PackageCheck, PackagePlus, Warehouse } from "lucide-react";
import { Chip } from "@/components/Chip";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { formatNaira, formatTime } from "@/lib/data/format";
import { listCompanyHubs, listCompanyRiders, listStops, PORTAL_NOW } from "@/lib/data";
import type { Stop, StopKind, StopStatus } from "@/lib/data/types";
import { cn } from "@/lib/cn";
import { PageHeader, Panel, RunLine, StopStatusTag } from "./ui";
import { usePortal, useLoad } from "./session";

const kindMeta: Record<StopKind, { label: string; icon: typeof MapPin }> = {
  hub: { label: "Hub", icon: Warehouse },
  pickup: { label: "Pickup", icon: PackagePlus },
  drop: { label: "Drop-off", icon: PackageCheck },
};

const STATUS_FILTERS: Array<{ value: StopStatus | "all"; label: string }> = [
  { value: "all", label: "All stops" },
  { value: "current", label: "On the way" },
  { value: "upcoming", label: "Upcoming" },
  { value: "done", label: "Done" },
  { value: "failed", label: "Failed attempts" },
];

/**
 * Stops: every rider's run today, in order, plus the company's hubs and pickup
 * points. Places are areas, never street addresses or live positions; drops
 * show only the receiver's display name (PRODUCT.md privacy rules).
 */
export function Stops() {
  const { session } = usePortal();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const riderFilter = params.get("rider") ?? "all";
  const statusFilter = (params.get("status") ?? "all") as StopStatus | "all";

  const data = useLoad(
    () => Promise.all([listStops(session), listCompanyRiders(session), listCompanyHubs(session)]),
    [session.staffId],
  );

  function setFilter(key: "rider" | "status", value: string) {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const header = <PageHeader title="Stops" meta={`Today's runs, as of ${formatTime(PORTAL_NOW)} WAT`} />;

  if (data.state !== "ready") {
    return (
      <>
        {header}
        {data.state === "error" ? (
          <DataTable caption="Stops" columns={[]} rows={[]} getRowId={() => ""} state="error" onRetry={data.reload} />
        ) : (
          <div className="flex flex-col gap-4" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-field border border-line bg-white p-5">
                <Skeleton className="w-40" />
                <Skeleton className="w-full" />
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  const [stops, riders, hubs] = data.data;
  const ridersWithRuns = riders.filter((r) => stops.some((s) => s.riderId === r.id));
  const groups = ridersWithRuns
    .filter((r) => riderFilter === "all" || r.id === riderFilter)
    .map((r) => ({
      rider: r,
      run: stops.filter((s) => s.riderId === r.id),
      shown: stops.filter((s) => s.riderId === r.id && (statusFilter === "all" || s.status === statusFilter)),
    }))
    .filter((g) => g.shown.length > 0);

  const count = (st: StopStatus | "all") =>
    stops.filter((s) => (riderFilter === "all" || s.riderId === riderFilter) && (st === "all" || s.status === st)).length;

  return (
    <>
      {header}

      <div className="mb-5 flex flex-col gap-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-[3px] pb-[3px] [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filter by rider">
          <Chip selected={riderFilter === "all"} onClick={() => setFilter("rider", "all")}>
            All riders
          </Chip>
          {ridersWithRuns.map((r) => (
            <Chip key={r.id} selected={riderFilter === r.id} onClick={() => setFilter("rider", r.id)}>
              {r.name}
            </Chip>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-[3px] pb-[3px] [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <Chip key={f.value} selected={statusFilter === f.value} count={count(f.value)} onClick={() => setFilter("status", f.value)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      {stops.length === 0 ? (
        <EmptyState
          icon={<MapPin strokeWidth={1.7} />}
          title="No runs planned for today."
          body="Stops appear here when parcels are assigned to your riders."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No stops match these filters."
          action={
            <button
              type="button"
              onClick={() => router.replace(pathname, { scroll: false })}
              className="inline-flex min-h-11 items-center text-[14px] font-semibold text-blue-700 hover:underline"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(({ rider, run, shown }) => {
            const done = run.filter((s) => s.status === "done" || s.status === "failed").length;
            return (
              <section key={rider.id} aria-labelledby={`run-${rider.id}`} className="rounded-field border border-line bg-white">
                <div className="grid gap-4 border-b border-line px-5 py-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <h2 id={`run-${rider.id}`} className="text-section-title text-ink-900">
                      <Link href={`/logistics/portal/riders/${rider.id}`} className="hover:underline">
                        {rider.name}
                      </Link>
                    </h2>
                    <p className="text-meta text-ink-500">
                      {rider.vehicle}, <span className="code-text">{rider.riderCode}</span>
                    </p>
                  </div>
                  <RunLine stops={run} size="md" />
                  <p className="text-meta text-ink-500 tabular-nums md:text-right">
                    <span className="text-ui font-medium text-ink-900">{done}</span> of {run.length} done
                  </p>
                </div>
                <ol className="relative">
                  {shown.map((s, i) => (
                    <StopRow key={s.id} stop={s} last={i === shown.length - 1} />
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      <Panel title="Hubs and pickup points" className="mt-8" bodyClassName="p-0">
        {hubs.length === 0 ? (
          <p className="px-5 py-8 text-center text-ui text-ink-500">No hubs yet. Buzz partner support adds hubs during onboarding.</p>
        ) : (
          <ul className="divide-y divide-line">
            {hubs.map((h) => (
              <li key={h.id} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                <div className="min-w-0">
                  <p className="text-ui font-medium text-ink-900">{h.name}</p>
                  <p className="text-meta text-ink-500">
                    {h.address}. {h.hours}.
                  </p>
                </div>
                <p className="text-meta text-ink-500 sm:text-right">
                  {h.pickupPoint
                    ? `Pickup point. ${formatNaira(h.storageFeePerDayAfterFree)} a day after 5 free days`
                    : "Sorting only, no collections"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function StopRow({ stop, last }: { stop: Stop; last: boolean }) {
  const K = kindMeta[stop.kind];
  return (
    <li
      className={cn(
        "grid grid-cols-[52px_minmax(0,1fr)] gap-x-3 px-5 py-3 md:grid-cols-[52px_minmax(0,1fr)_170px_150px] md:items-center",
        !last && "border-b border-line",
        stop.status === "current" && "bg-blue-50",
      )}
    >
      <span className="text-meta text-ink-500 tabular-nums">
        <span className="block text-ui font-medium text-ink-900">{formatTime(stop.doneAt ?? stop.plannedAt)}</span>
        {stop.doneAt ? "done" : "planned"}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-ui text-ink-900">
          <K.icon aria-hidden="true" className="size-4 shrink-0 text-ink-500" strokeWidth={1.7} />
          <span className="truncate">
            <span className="sr-only">{K.label}: </span>
            {stop.place}
            {stop.kind !== "hub" && <span className="text-ink-500">, {stop.city}</span>}
          </span>
        </p>
        <p className="mt-0.5 pl-6 text-meta text-ink-500">
          {K.label}
          {stop.receiverName && <> for {stop.receiverName}</>}
        </p>
        {stop.note && <p className="pl-6 text-meta text-warn-700">{stop.note}</p>}
      </div>
      <span className="col-start-2 mt-1 pl-6 text-meta md:col-start-auto md:mt-0 md:pl-0">
        {stop.trackingId ? <span className="code-text text-ink-700">{stop.trackingId}</span> : <span className="text-ink-500">Start of run</span>}
      </span>
      <span className="col-start-2 mt-1 pl-6 md:col-start-auto md:mt-0 md:pl-0 md:text-right">
        <StopStatusTag status={stop.status} />
      </span>
    </li>
  );
}
