"use client";

import { Download, Wallet } from "lucide-react";
import { Button } from "@/components/Button";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { formatDate, formatNaira, listCompanyPayouts, type CompanyPayouts } from "@/lib/data";
import type { Payout } from "@/lib/data/types";
import { AccessDenied, PageHeader, Panel, StatStrip } from "./ui";
import { usePortal, useLoad } from "./session";

const monthName = (ym: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T00:00:00Z`));

/** A month's statement as CSV, built in the browser from the same rows */
function downloadStatement(month: string, days: Payout[], company: string) {
  const rows = days.filter((d) => d.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date));
  const lines = [
    `Buzz Logistics statement,${company},${monthName(month)}`,
    "Test data: not a real statement",
    "",
    "Date,Deliveries,Your earnings (NGN),Paid,Buzz share (NGN),Buzz settlement,Buzz settled",
    ...rows.map((d) => [d.date, d.deliveries, d.partnerEarnings, d.partnerPaid, d.buzzShare, d.buzzSettlement, d.buzzSettled ? "yes" : "no"].join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `buzz-statement-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Payouts (DESIGN.md §10.2): earnings per day (paid straight after each
 * delivery), Buzz's share (settled immediately or at T+2) and monthly
 * statements to download. Super admins only.
 */
export function PortalPayouts() {
  const { session, company, can } = usePortal();
  const allowed = can("view_payouts");
  const data = useLoad<CompanyPayouts | null>(() => (allowed ? listCompanyPayouts(session) : Promise.resolve(null)), [session.staffId, allowed]);
  if (!allowed) return <AccessDenied what="see payouts" />;

  const columns: Column<Payout>[] = [
    { key: "date", header: "Date", mobile: "primary", cell: (d) => formatDate(`${d.date}T12:00:00+01:00`) },
    { key: "earn", header: "Your earnings", align: "right", mobile: "primary", cell: (d) => <span className="font-semibold tabular-nums">{formatNaira(d.partnerEarnings)}</span> },
    { key: "n", header: "Deliveries", align: "right", cell: (d) => <span className="tabular-nums">{d.deliveries}</span> },
    { key: "paid", header: "Paid", mobile: "hidden", cell: (d) => (d.partnerPaid === "immediate" ? "After each delivery" : d.partnerPaid) },
    { key: "buzz", header: "Buzz share", align: "right", cell: (d) => <span className="tabular-nums">{formatNaira(d.buzzShare)}</span> },
    {
      key: "settled",
      header: "Buzz share settled",
      mobile: "hidden",
      cell: (d) => (d.buzzSettled ? <span className="text-ok-700">Settled</span> : <span className="text-ink-700">Due ({d.buzzSettlement})</span>),
    },
  ];

  const state: TableState = data.state === "loading" ? "loading" : data.state === "error" ? "error" : !data.data || data.data.days.length === 0 ? "empty" : "ready";

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <PageHeader title="Payouts" meta="You're paid straight after each delivery. Buzz's share comes from the buyer and settles on your agreed terms." />
      <div className="flex flex-col gap-6">
        {data.state === "loading" ? (
          <Skeleton className="h-24 w-full" />
        ) : data.data ? (
          <StatStrip
            items={[
              { label: "Paid today", value: formatNaira(data.data.paidToday), note: "Straight after each delivery" },
              { label: "Buzz share due", value: formatNaira(data.data.buzzPending), note: "Not settled yet (T+2)" },
              { label: "This month", value: formatNaira(data.data.months[0]?.earnings ?? 0), note: data.data.months[0] ? monthName(data.data.months[0].month) : undefined },
            ]}
          />
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <DataTable
            caption="Earnings per day"
            columns={columns}
            rows={data.data?.days ?? []}
            getRowId={(d) => d.date}
            state={state}
            onRetry={data.reload}
            empty={<EmptyState icon={<Wallet strokeWidth={1.7} />} title="No payouts yet." body="Each completed delivery is paid here straight away." />}
            className="bg-white"
          />
          <Panel title="Monthly statements" bodyClassName="p-0">
            {data.data && data.data.months.length > 0 ? (
              <ul className="divide-y divide-line">
                {data.data.months.map((m) => (
                  <li key={m.month} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="min-w-0">
                      <span className="block text-ui font-semibold text-ink-900">{monthName(m.month)}</span>
                      <span className="block text-meta text-ink-500 tabular-nums">
                        {m.deliveries} deliveries, {formatNaira(m.earnings)}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadStatement(m.month, data.data!.days, company.name)}
                      icon={<Download aria-hidden="true" className="size-4" strokeWidth={1.8} />}
                    >
                      CSV
                      <span className="sr-only"> statement for {monthName(m.month)}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-ui text-ink-500">Statements appear after your first month.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
