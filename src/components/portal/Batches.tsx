"use client";

import { useState } from "react";
import { Info, Layers } from "lucide-react";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { FilterChips, routeText } from "@/components/logistics/ops";
import { BatchDetail } from "@/components/logistics/ops-cases";
import { formatDayTime, listCompanyBatches, type CompanyBatch } from "@/lib/data";
import type { ParcelStatus } from "@/lib/data/types";
import { AccessDenied, PageHeader } from "./ui";
import { usePortal, useLoad } from "./session";

type Show = "open" | "closed" | "all";
const isClosed = (b: CompanyBatch) => !!b.closedAt || b.status === "delivered";
/** Batch statuses outside the parcel set (e.g. at_checkpoint) read as in transit */
const pill = (s: string): ParcelStatus =>
  (["delivered", "in_transit", "picked_up", "at_pickup_point", "out_for_delivery"] as string[]).includes(s) ? (s as ParcelStatus) : "in_transit";

/**
 * Batches (mother QR), DESIGN.md §10.2: mother code, rider, route, linked /
 * total, status, last scan; open / closed filter. Detail: the mother card,
 * child parcels and the history. Read-only: batches change only in the app.
 */
export function PortalBatches() {
  const { session, can } = usePortal();
  const [show, setShow] = useState<Show>("open");
  const [openId, setOpenId] = useState<string | null>(null);
  const allowed = can("view_batches");
  const data = useLoad(() => (allowed ? listCompanyBatches(session) : Promise.resolve([])), [session.staffId, allowed]);
  if (!allowed) return <AccessDenied what="see batches" />;

  const rows = (data.data ?? []).filter((b) => (show === "all" ? true : show === "open" ? !isClosed(b) : isClosed(b)));
  const open = data.data?.find((b) => b.id === openId) ?? null;

  const columns: Column<CompanyBatch>[] = [
    { key: "id", header: "Mother code", mobile: "primary", cell: (b) => <span className="code-text text-ink-900">{b.id}</span> },
    { key: "status", header: "Status", mobile: "primary", cell: (b) => (isClosed(b) ? <span className="text-ink-500">Closed</span> : <StatusPill status={pill(b.status)} size="sm" />) },
    { key: "rider", header: "Rider", cell: (b) => b.riderName },
    { key: "route", header: "Route", cell: (b) => routeText(b.route) },
    {
      key: "linked",
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
    <div className="mx-auto w-full max-w-[1280px]">
      <PageHeader title="Batches" meta="Mother QR codes your riders use to move parcels together" />
      <p className="mb-4 flex max-w-[60em] items-start gap-2 text-ui text-ink-700">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-600" strokeWidth={1.8} />
        When a rider scans a second parcel while one is in hand, the Buzz app creates a mother QR and links both. Every parcel scanned after joins it, and the rider
        unlinks each one at its stop. Batches change only in the app.
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
        caption="Your company's batches"
        columns={columns}
        rows={rows}
        getRowId={(b) => b.id}
        rowLabel={(b) => `Open batch ${b.id}`}
        selectedId={openId}
        onSelect={(b) => setOpenId(b.id)}
        state={state}
        onRetry={data.reload}
        empty={<EmptyState icon={<Layers strokeWidth={1.7} />} title="No batches yet." body="They appear when your riders scan two parcels together in the Buzz app." />}
        noResults={<EmptyState icon={<Layers strokeWidth={1.7} />} title={show === "open" ? "No open batches right now." : "No closed batches yet."} />}
        className="bg-white"
      />
      <Drawer open={!!open} onOpenChange={(o) => !o && setOpenId(null)} title={open ? `Batch ${open.id}` : "Batch"} description={open ? routeText(open.route) : undefined}>
        {open && <BatchDetail batch={open} extraRows={[["Rider", open.riderName]]} />}
      </Drawer>
    </div>
  );
}
