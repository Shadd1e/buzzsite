"use client";

import { useState } from "react";
import { Package, Search } from "lucide-react";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { PageHeader } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { formatDayTime, listMyParcels, type RiderParcelFilter } from "@/lib/data";
import type { Parcel } from "@/lib/data/types";
import { FilterChips, lastEvent, ParcelDetail, routeText } from "@/components/logistics/ops";

const FILTERS: Array<{ key: RiderParcelFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "to_collect", label: "To collect" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "needs_attention", label: "Needs attention" },
];

/**
 * Parcels (DESIGN.md §10.2, only theirs): table (stacked rows on phones) with
 * filter chips and search by tracking or order ID. Row → detail drawer with
 * the full history. Read-only: scans happen in the Buzz app.
 */
export function RiderParcels() {
  const { session } = useAccount();
  const [filter, setFilter] = useState<RiderParcelFilter>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Parcel | null>(null);
  // All parcels once for the chip counts; the filtered list for the table
  const all = useLoad(() => listMyParcels(session), [session.id]);
  const rows = useLoad(() => listMyParcels(session, { filter, search }), [session.id, filter, search]);

  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.key, f.key === "all" ? (all.data?.length ?? 0) : 0]),
  ) as Record<RiderParcelFilter, number>;

  const columns: Column<Parcel>[] = [
    { key: "id", header: "Tracking ID", mobile: "primary", cell: (p) => <span className="code-text text-ink-900">{p.trackingId}</span> },
    { key: "status", header: "Status", mobile: "primary", cell: (p) => <StatusPill status={p.status} size="sm" /> },
    { key: "route", header: "Route", cell: (p) => <span className="text-ink-900">{routeText(p.route)}</span> },
    { key: "batch", header: "Batch", mobile: "hidden", cell: (p) => (p.batchId ? <span className="code-text">{p.batchId}</span> : <span className="text-ink-500">None</span>) },
    {
      key: "last",
      header: "Last scan",
      cell: (p) => {
        const e = lastEvent(p);
        return (
          <span className="text-ink-700">
            {e.city}, {formatDayTime(e.at)}
          </span>
        );
      },
    },
  ];

  const state: TableState =
    rows.state === "loading"
      ? "loading"
      : rows.state === "error"
        ? "error"
        : all.data?.length === 0
          ? "empty"
          : rows.data.length === 0
            ? "no-results"
            : "ready";

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader title="Parcels" meta={all.data ? `${counts.all} parcels assigned to you` : undefined} />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterChips label="Show" options={FILTERS} value={filter} onChange={setFilter} />
        <label className="relative block md:w-72">
          <span className="sr-only">Search by tracking ID or order ID</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500" strokeWidth={1.8} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tracking or order ID"
            className="h-11 w-full rounded-full border-[1.5px] border-line-strong bg-white pr-4 pl-10 text-[16px] text-ink-900 placeholder:text-ink-500 hover:border-ink-500 focus:outline-3 focus:outline-offset-3 focus:outline-sky-400 md:text-[15px]"
          />
        </label>
      </div>

      <DataTable
        caption="Your parcels"
        columns={columns}
        rows={rows.data ?? []}
        getRowId={(p) => p.trackingId}
        rowLabel={(p) => `Open parcel ${p.trackingId}`}
        selectedId={open?.trackingId}
        onSelect={setOpen}
        state={state}
        onRetry={rows.reload}
        empty={<EmptyState icon={<Package strokeWidth={1.7} />} title="No parcels assigned to you yet." body="Parcels show here once you scan them in the Buzz app." />}
        noResults={
          <EmptyState
            icon={<Search strokeWidth={1.7} />}
            title="No parcels match this filter."
            body="Try another filter, or check the tracking ID."
          />
        }
        className="bg-white"
      />

      <Drawer open={!!open} onOpenChange={(o) => !o && setOpen(null)} title={open ? open.item : "Parcel"} description={open?.trackingId}>
        {open && <ParcelDetail parcel={open} />}
      </Drawer>
    </div>
  );
}
