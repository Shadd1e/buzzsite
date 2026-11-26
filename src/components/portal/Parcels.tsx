"use client";

import { useState } from "react";
import { Package, Phone, Printer, Search, UserRoundCog } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { useToast } from "@/components/Toast";
import { FilterChips, lastEvent, ParcelDetail, routeText } from "@/components/logistics/ops";
import {
  assignParcelRider,
  formatDayTime,
  listCompanyParcels,
  listCompanyRiders,
  PortalError,
  type CompanyParcel,
  type CompanyParcelFilter,
} from "@/lib/data";
import { AccessDenied, PageHeader } from "./ui";
import { usePortal, useLoad } from "./session";

const FILTERS: Array<{ key: CompanyParcelFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "booked", label: "Booked" },
  { key: "moving", label: "On the move" },
  { key: "at_pickup_point", label: "At pickup points" },
  { key: "delivered", label: "Delivered" },
  { key: "attention", label: "Needs attention" },
];

const FINISHED = ["delivered", "returned", "refused", "disputed"];

/**
 * Parcels (DESIGN.md §10.2): table (stacked rows on phones) with filter chips
 * and search by any code. Row → detail drawer: full history, codes as
 * "verified" only, receiver name and preferred contact, and the actions:
 * reprint label, assign rider, Call receiver (final delivery step only).
 */
export function PortalParcels() {
  const { session, can } = usePortal();
  const [filter, setFilter] = useState<CompanyParcelFilter>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const allowed = can("view_parcels");
  const all = useLoad(() => (allowed ? listCompanyParcels(session) : Promise.resolve([])), [session.staffId, allowed]);
  const rows = useLoad(
    () => (allowed ? listCompanyParcels(session, { filter, search }) : Promise.resolve([])),
    [session.staffId, allowed, filter, search],
  );
  if (!allowed) return <AccessDenied what="see parcels" />;

  const open = rows.data?.find((p) => p.trackingId === openId) ?? all.data?.find((p) => p.trackingId === openId) ?? null;

  const columns: Column<CompanyParcel>[] = [
    { key: "id", header: "Tracking ID", mobile: "primary", cell: (p) => <span className="code-text text-ink-900">{p.trackingId}</span> },
    { key: "status", header: "Status", mobile: "primary", cell: (p) => <StatusPill status={p.status} size="sm" /> },
    { key: "order", header: "Order ID", mobile: "hidden", cell: (p) => <span className="code-text">{p.orderId}</span> },
    { key: "route", header: "Route", cell: (p) => routeText(p.route) },
    { key: "rider", header: "Rider", cell: (p) => p.riderName ?? <span className="text-ink-500">Not assigned</span> },
    { key: "batch", header: "Batch", mobile: "hidden", cell: (p) => (p.batchId ? <span className="code-text">{p.batchId}</span> : <span className="text-ink-500">None</span>) },
    {
      key: "last",
      header: "Last scan",
      cell: (p) => {
        const e = lastEvent(p);
        return `${e.city}, ${formatDayTime(e.at)}`;
      },
    },
  ];

  const state: TableState =
    rows.state === "loading" ? "loading" : rows.state === "error" ? "error" : all.data?.length === 0 ? "empty" : rows.data.length === 0 ? "no-results" : "ready";

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <PageHeader
        title="Parcels"
        meta={all.data ? `${all.data.length} parcels with your company` : undefined}
        actions={
          can("print_label") && (
            <ButtonLink href="/logistics/portal/label" variant="outline" size="sm" icon={<Printer aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
              Generate label
            </ButtonLink>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips label="Show" options={FILTERS} value={filter} onChange={setFilter} />
        <label className="relative block lg:w-80">
          <span className="sr-only">Search by tracking ID, order ID or batch</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500" strokeWidth={1.8} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tracking, order or batch code"
            className="h-11 w-full rounded-full border-[1.5px] border-line-strong bg-white pr-4 pl-10 text-[16px] text-ink-900 placeholder:text-ink-500 hover:border-ink-500 focus:outline-3 focus:outline-offset-3 focus:outline-sky-400 md:text-[15px]"
          />
        </label>
      </div>

      <DataTable
        caption="Parcels with your company"
        columns={columns}
        rows={rows.data ?? []}
        getRowId={(p) => p.trackingId}
        rowLabel={(p) => `Open parcel ${p.trackingId}`}
        selectedId={openId}
        onSelect={(p) => setOpenId(p.trackingId)}
        state={state}
        onRetry={rows.reload}
        empty={<EmptyState icon={<Package strokeWidth={1.7} />} title="No parcels yet." body="Generate a label at pickup and the parcel shows here." />}
        noResults={<EmptyState icon={<Search strokeWidth={1.7} />} title="No parcels match this filter." body="Try another filter, or check the code." />}
        className="bg-white"
      />

      <Drawer
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open ? open.item : "Parcel"}
        description={open?.trackingId}
        footer={open && <ParcelActions parcel={open} onChanged={() => (rows.reload(), all.reload())} />}
      >
        {open && (
          <div className="flex flex-col gap-4">
            <p className="text-ui text-ink-700">
              Rider: <span className="font-semibold text-ink-900">{open.riderName ?? "Not assigned"}</span>
              {open.labelPrintedAt && <span className="text-ink-500">. Label printed {formatDayTime(open.labelPrintedAt)}</span>}
            </p>
            <ParcelDetail parcel={open} />
          </div>
        )}
      </Drawer>
    </div>
  );
}

function ParcelActions({ parcel: p, onChanged }: { parcel: CompanyParcel; onChanged: () => void }) {
  const { session, can } = usePortal();
  const toast = useToast();
  const [assigning, setAssigning] = useState(false);
  const [riderId, setRiderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const riders = useLoad(
    () => (assigning ? listCompanyRiders(session, { status: "active" }) : Promise.resolve([])),
    [session.staffId, assigning],
  );
  const finished = FINISHED.includes(p.status);
  const finalStep = p.status === "out_for_delivery";

  async function assign() {
    if (!riderId) return setError("Pick a rider.");
    setBusy(true);
    setError(null);
    try {
      const updated = await assignParcelRider(session, p.trackingId, riderId);
      toast({ title: "Rider assigned", description: `${updated.riderName} now has ${p.trackingId}.` });
      setAssigning(false);
      onChanged();
    } catch (e) {
      setError(e instanceof PortalError ? (e.fields?.riderId ?? e.message) : "That didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (assigning) {
    return (
      <div className="flex flex-col gap-3">
        <label htmlFor="assign-rider" className="text-[14px] font-semibold text-ink-900">
          Give this parcel to
        </label>
        <select
          id="assign-rider"
          value={riderId}
          onChange={(e) => setRiderId(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "assign-error" : undefined}
          className="h-13 w-full rounded-field border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink-900 hover:border-ink-500 focus:outline-3 focus:outline-offset-3 focus:outline-sky-400"
        >
          <option value="">{riders.state === "loading" ? "Loading riders" : "Choose an active rider"}</option>
          {(riders.data ?? [])
            .filter((r) => r.id !== p.riderId)
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}, {r.riderCode}
              </option>
            ))}
        </select>
        {error && (
          <p id="assign-error" className="text-[14px] text-alert-700">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" loading={busy} onClick={assign}>
            Assign rider
          </Button>
          <Button size="sm" variant="outline" onClick={() => (setAssigning(false), setError(null))}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {can("print_label") && (
        <ButtonLink
          href={`/logistics/portal/label?order=${encodeURIComponent(p.orderId)}`}
          variant="outline"
          size="sm"
          icon={<Printer aria-hidden="true" className="size-4" strokeWidth={1.8} />}
        >
          Reprint label
        </ButtonLink>
      )}
      {can("assign_rider") && !finished && (
        <Button variant="outline" size="sm" onClick={() => setAssigning(true)} icon={<UserRoundCog aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
          {p.riderId ? "Change rider" : "Assign rider"}
        </Button>
      )}
      {/* PRODUCT.md: the call button appears only at the final delivery step */}
      {finalStep && (
        <Button
          size="sm"
          onClick={() =>
            toast({
              title: "Calling through Buzz",
              description: "Test build: no call is placed. The receiver's number stays hidden; the call goes through Buzz.",
            })
          }
          icon={<Phone aria-hidden="true" className="size-4" strokeWidth={1.8} />}
        >
          Call receiver
        </Button>
      )}
    </div>
  );
}
