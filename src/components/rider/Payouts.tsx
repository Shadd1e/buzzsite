"use client";

import { Wallet } from "lucide-react";
import { Code } from "@/components/Code";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { PageHeader, StatStrip } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { formatDayTime, formatNaira, listRiderPayouts } from "@/lib/data";
import type { RiderPayout } from "@/lib/data/types";
import { LoadError } from "./states";

/**
 * Payouts (DESIGN.md §10.2): earnings per delivery, paid straight after it,
 * and Buzz's share. Pay on an order with an open dispute is held until it's
 * decided. Individual riders only.
 */
export function RiderPayouts() {
  const { session } = useAccount();
  const data = useLoad(() => listRiderPayouts(session), [session.id]);

  const columns: Column<RiderPayout>[] = [
    { key: "when", header: "Delivered", mobile: "primary", cell: (x) => formatDayTime(x.deliveredAt) },
    { key: "earn", header: "You earned", align: "right", mobile: "primary", cell: (x) => <span className="font-semibold tabular-nums">{formatNaira(x.earnings)}</span> },
    { key: "id", header: "Tracking ID", cell: (x) => <Code value={x.trackingId} label="Tracking ID" size="sm" copyable={false} /> },
    { key: "km", header: "Distance", align: "right", mobile: "hidden", cell: (x) => <span className="tabular-nums">{x.distanceKm} km</span> },
    { key: "buzz", header: "Buzz share", align: "right", mobile: "hidden", cell: (x) => <span className="tabular-nums">{formatNaira(x.buzzShare)}</span> },
    {
      key: "status",
      header: "Status",
      cell: (x) =>
        x.status === "paid" ? (
          <span className="text-ok-700">Paid</span>
        ) : (
          <span className="text-warn-700">Held: dispute open</span>
        ),
    },
  ];

  const state: TableState = data.state === "loading" ? "loading" : data.state === "error" ? "error" : data.data.entries.length === 0 ? "empty" : "ready";

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader title="Payouts" meta="You're paid straight after each delivery. Buzz's share comes from the buyer, on top of your rate." />
      {data.state === "error" ? (
        <LoadError onRetry={data.reload} />
      ) : (
        <div className="flex flex-col gap-6">
          {data.state === "loading" ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <StatStrip
              items={[
                { label: "Paid today", value: formatNaira(data.data.paidToday) },
                { label: "Paid this week", value: formatNaira(data.data.paidThisWeek), note: "The last 7 days" },
                { label: "Held", value: formatNaira(data.data.held), note: data.data.held ? "Until the dispute is decided" : "Nothing held" },
              ]}
            />
          )}
          <DataTable
            caption="Your payouts, one row per delivery"
            columns={columns}
            rows={data.data?.entries ?? []}
            getRowId={(x) => x.trackingId}
            state={state}
            onRetry={data.reload}
            empty={<EmptyState icon={<Wallet strokeWidth={1.7} />} title="No payouts yet." body="Each delivery you complete is paid here straight away." />}
            className="bg-white"
          />
        </div>
      )}
    </div>
  );
}
