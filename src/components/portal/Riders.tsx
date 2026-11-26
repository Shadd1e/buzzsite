"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Search, Smartphone, UserPlus } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/Tabs";
import { getFleetStats, listCompanyRiders } from "@/lib/data";
import { formatPercent, maskPhone } from "@/lib/data/format";
import type { Rider, RiderStats, RiderStatus } from "@/lib/data/types";
import { PageHeader, RiderStatusPill } from "./ui";
import { usePortal, useLoad } from "./session";

type Row = Rider & { stats?: RiderStats };

const TABS: Array<{ value: RiderStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "pending_verification", label: "Pending verification" },
  { value: "deactivated", label: "Deactivated" },
  { value: "frozen", label: "Frozen by Buzz" },
];

/**
 * Riders (DESIGN.md §10.2): tabs by status, search by name or rider code, a
 * table with 7-day performance so managers can compare riders at a glance.
 * Row → rider profile.
 */
export function Riders() {
  const { session, can } = usePortal();
  const router = useRouter();
  const [tab, setTab] = useState<RiderStatus>("active");
  const [query, setQuery] = useState("");

  const data = useLoad(() => Promise.all([listCompanyRiders(session), getFleetStats(session, 7)]), [session.staffId]);

  const riders: Row[] =
    data.state === "ready"
      ? data.data[0].map((r) => ({ ...r, stats: data.data[1].riders.find((s) => s.riderId === r.id) }))
      : [];
  const counts = Object.fromEntries(TABS.map((t) => [t.value, riders.filter((r) => r.status === t.value).length])) as Record<RiderStatus, number>;
  const needle = query.trim().toLowerCase();
  const rows = riders.filter(
    (r) => r.status === tab && (!needle || r.name.toLowerCase().includes(needle) || r.riderCode.toLowerCase().includes(needle)),
  );

  const state: TableState =
    data.state === "loading"
      ? "loading"
      : data.state === "error"
        ? "error"
        : counts[tab] === 0
          ? "empty"
          : rows.length === 0
            ? "no-results"
            : "ready";

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Name",
      mobile: "primary",
      cell: (r) => <span className="font-semibold">{r.name}</span>,
    },
    {
      key: "code",
      header: "Rider code",
      mobile: "secondary",
      cell: (r) => <span className="code-text">{r.riderCode}</span>,
    },
    { key: "phone", header: "Phone", mobile: "hidden", cell: (r) => <span className="text-ink-700">{maskPhone(r.phone)}</span> },
    { key: "vehicle", header: "Vehicle", mobile: "secondary", cell: (r) => r.vehicle },
    {
      key: "app",
      header: "App",
      mobile: "hidden",
      cell: (r) =>
        r.appSignedIn ? (
          <span className="inline-flex items-center gap-1.5 text-ok-700">
            <Smartphone aria-hidden="true" className="size-4" strokeWidth={1.8} /> Signed in
          </span>
        ) : (
          <span className="text-ink-500">Not signed in</span>
        ),
    },
    ...(tab === "active"
      ? ([
          { key: "scans", header: "Scans today", align: "right", mobile: "hidden", cell: (r) => r.scansToday },
          { key: "delivered", header: "Delivered, 7 days", align: "right", mobile: "secondary", cell: (r) => (
            <>
              {r.stats?.delivered ?? "–"}
              <span className="md:hidden"> delivered in 7 days</span>
            </>
          ) },
          { key: "success", header: "Success", align: "right", mobile: "secondary", cell: (r) => (
            <>
              {formatPercent(r.stats?.successRate ?? null)}
              <span className="md:hidden"> success</span>
            </>
          ) },
          { key: "ontime", header: "On time", align: "right", mobile: "hidden", cell: (r) => formatPercent(r.stats?.onTimeRate ?? null) },
          { key: "rating", header: "Rating", align: "right", mobile: "hidden", cell: (r) => (r.rating === null ? "–" : r.rating.toFixed(1)) },
        ] satisfies Column<Row>[])
      : [
          {
            key: "status",
            header: "Status",
            mobile: "primary",
            cell: (r: Row) => (
              <span className="inline-flex items-center gap-2">
                <RiderStatusPill status={r.status} size="sm" />
                {r.deactivatedReason && <span className="text-meta text-ink-500">{r.deactivatedReason}</span>}
              </span>
            ),
          } satisfies Column<Row>,
        ]),
  ];

  const emptyCopy: Record<RiderStatus, { title: string; body?: string }> = {
    active: { title: "No riders yet. Add your first rider to give them a rider code." },
    pending_verification: { title: "No one is waiting for verification." },
    deactivated: { title: "No deactivated riders.", body: "When you deactivate a rider, their history stays here." },
    frozen: { title: "No riders are frozen." },
  };

  return (
    <>
      <PageHeader
        title="Riders"
        meta="Riders sign in to the Buzz app with your company code and their rider code."
        actions={
          can("register_rider") && (
            <ButtonLink href="/logistics/portal/riders/new" size="sm" icon={<UserPlus aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
              Add rider
            </ButtonLink>
          )
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as RiderStatus)}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <TabsList aria-label="Rider status" className="flex-1">
            {TABS.filter((t) => t.value !== "frozen" || counts.frozen > 0).map((t) => (
              <TabsTrigger key={t.value} value={t.value} count={data.state === "ready" ? counts[t.value] : undefined}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <label className="relative block lg:w-72">
            <span className="sr-only">Search riders by name or rider code</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500" strokeWidth={1.8} />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or rider code"
              className="h-11 pl-10"
            />
          </label>
        </div>
      </Tabs>

      <div className="mt-5">
        <DataTable
          caption={`${TABS.find((t) => t.value === tab)?.label} riders`}
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          rowLabel={(r) => `Open ${r.name}'s profile`}
          onSelect={(r) => router.push(`/logistics/portal/riders/${r.id}`)}
          state={state}
          onRetry={data.reload}
          empty={
            <EmptyState
              icon={<Bike strokeWidth={1.7} />}
              title={emptyCopy[tab].title}
              body={emptyCopy[tab].body}
              action={
                tab === "active" &&
                can("register_rider") && (
                  <ButtonLink href="/logistics/portal/riders/new" size="sm">
                    Add rider
                  </ButtonLink>
                )
              }
            />
          }
          noResults={
            <EmptyState
              title={`No riders match “${query.trim()}”.`}
              body="Check the spelling, or search by rider code, like R-QJGF-85."
              action={
                <button type="button" onClick={() => setQuery("")} className="inline-flex min-h-11 items-center text-[14px] font-semibold text-blue-700 hover:underline">
                  Clear search
                </button>
              }
            />
          }
        />
      </div>
      {tab === "active" && state === "ready" && (
        <p className="mt-3 text-meta text-ink-500">Delivered, success and on-time figures cover the last 7 days. Ratings come from buyers.</p>
      )}
    </>
  );
}
