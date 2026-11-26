"use client";

import { useState } from "react";
import { Info, Layers } from "lucide-react";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { PageHeader } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { formatDayTime, listRiderBatches } from "@/lib/data";
import type { Batch, ParcelStatus } from "@/lib/data/types";
import { FilterChips, routeText } from "@/components/logistics/ops";
import { BatchDetail } from "@/components/logistics/ops-cases";

type Show = "open" | "closed" | "all";
const isClosed = (b: Batch) => !!b.closedAt || b.status === "delivered";
/** Batch statuses outside the parcel set (e.g. at_checkpoint) read as in transit */
const pillStatus = (s: string): ParcelStatus => (["delivered", "in_transit", "picked_up", "at_pickup_point", "out_for_delivery"].includes(s) ? (s as ParcelStatus) : "in_transit");

/**
 * Batches (mother QR), only theirs (DESIGN.md §10.2). List with open / closed
 * filter; detail shows the mother card, the child parcels (unlinked ones say
 * where and when) and the history. Read-only: batches change only in the app.
 */
export function RiderBatches() {
  const { session } = useAccount();
  const [show, setShow] = useState<Show>("open");
  const [open, setOpen] = useState<Batch | null>(null);
  const data = useLoad(() => listRiderBatches(session), [session.id]);
  const rows = (data.data ?? []).filter((b) => (show === "all" ? true : show === "open" ? !isClosed(b) : isClosed(b)));

  const columns: Column<Batch>[] = [
    { key: "id", header: "Mother code", mobile: "primary", cell: (b) => <span className="code-text text-ink-900">{b.id}</span> },
    { key: "status", header: "Status", mobile: "primary", cell: (b) => (isClosed(b) ? <span className="text-ink-500">Closed</span> : <StatusPill status={pillStatus(b.status)} size="sm" />) },
    { key: "route", header: "Route", cell: (b) => routeText(b.route) },
    {
      key: "children",
      header: "Linked",
      cell: (b) => (
        <span className="tabular-nums">
          {b.children.filter((c) => !c.unlinkedAt).length} of {b.children.length}
        </span>
      ),
    },
    { key: "last", header: "Last scan", cell: (b) => `${b.lastScan.city}, ${formatDayTime(b.lastScan.at)}` },
  ];

  const state: TableState =
    data.state === "loading" ? "loading" : data.state === "error" ? "error" : data.data.length === 0 ? "empty" : rows.length === 0 ? "no-results" : "ready";

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader title="Batches" meta="Mother QR codes that group the parcels you carry together" />

      <p className="mb-4 flex items-start gap-2 text-ui text-ink-700">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-600" strokeWidth={1.8} />
        Scan a second parcel while one is in hand and the Buzz app creates a mother QR and links both. You unlink each parcel in the app when you drop it off.
        Batches change only in the app.
      </p>

      <div className="mb-4">
        <FilterChips
          label="Show"
          value={show}
          onChange={setShow}
          options={[
            { key: "open", label: "Open" },
            { key: "closed", label: "Closed" },
            { key: "all", label: "All" },
          ]}
        />
      </div>

      <DataTable
        caption="Your batches"
        columns={columns}
        rows={rows}
        getRowId={(b) => b.id}
        rowLabel={(b) => `Open batch ${b.id}`}
        selectedId={open?.id}
        onSelect={setOpen}
        state={state}
        onRetry={data.reload}
        empty={<EmptyState icon={<Layers strokeWidth={1.7} />} title="No batches yet." body="A batch starts when you scan a second parcel while one is in hand." />}
        noResults={<EmptyState icon={<Layers strokeWidth={1.7} />} title={show === "open" ? "No open batches right now." : "No closed batches yet."} />}
        className="bg-white"
      />

      <Drawer open={!!open} onOpenChange={(o) => !o && setOpen(null)} title={open ? `Batch ${open.id}` : "Batch"} description={open ? routeText(open.route) : undefined}>
        {open && <BatchDetail batch={open} />}
      </Drawer>
    </div>
  );
}

