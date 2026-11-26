"use client";

import Link from "next/link";
import { Layers, ScanLine } from "lucide-react";
import { Bubble } from "@/components/chat";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { TestNote } from "@/components/logistics/signin/shared";
import { PageHeader, Panel, StatStrip } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { formatDate, formatDayTime, formatNaira, formatTime, getRiderOverview, PORTAL_NOW } from "@/lib/data";
import { RIDER_PATH } from "@/lib/portal-access";
import { LoadError } from "./states";
import { routeText } from "@/components/logistics/ops";
import { useRider } from "./RiderShell";

const dayName = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "Africa/Lagos" });

/**
 * Overview (DESIGN.md §10.2, individual rider portal): today (to collect, in
 * transit, delivered, earnings today), my active batch, recent scans as small
 * system bubbles.
 */
export function RiderOverview() {
  const { session } = useAccount();
  const me = useRider();
  const data = useLoad(() => getRiderOverview(session), [session.id]);
  const first = me.name.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader title="Today" meta={`${dayName.format(new Date(PORTAL_NOW))} ${formatDate(PORTAL_NOW)}. Hello, ${first}.`} />

      {data.state === "error" ? (
        <LoadError onRetry={data.reload} />
      ) : data.state === "loading" ? (
        <div className="flex flex-col gap-6" aria-busy="true">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <StatStrip
            items={[
              { label: "To collect", value: data.data.toCollect, note: "Assigned, not picked up yet" },
              { label: "In transit", value: data.data.inTransit, note: "Picked up or out for delivery" },
              { label: "Delivered today", value: data.data.deliveredToday },
              ...(data.data.earningsToday !== null
                ? [{ label: "Earnings today", value: formatNaira(data.data.earningsToday), note: "Paid after each delivery" }]
                : []),
            ]}
          />

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Panel
              title="My active batch"
              action={
                <Link href={`${RIDER_PATH}/batches`} className="text-ui font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4">
                  All batches
                </Link>
              }
            >
              {data.data.activeBatch ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Layers aria-hidden="true" className="size-5 text-blue-600" strokeWidth={1.7} />
                    <span className="code-text text-[17px] text-ink-900">{data.data.activeBatch.id}</span>
                  </div>
                  <p className="text-ui text-ink-700">{routeText(data.data.activeBatch.route)}</p>
                  <p className="text-ui text-ink-900">
                    <span className="tabular-nums">
                      {data.data.activeBatch.children.filter((c) => !c.unlinkedAt).length} of {data.data.activeBatch.children.length}
                    </span>{" "}
                    parcels still linked
                  </p>
                  <p className="text-meta text-ink-500">
                    Last scan {data.data.activeBatch.lastScan.city}, {formatDayTime(data.data.activeBatch.lastScan.at)}
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={<Layers strokeWidth={1.7} />}
                  title="No open batch."
                  body="Scan a second parcel while one is in hand and the Buzz app links them under a mother QR."
                  className="border-0 py-6"
                />
              )}
            </Panel>

            <Panel title="Recent scans">
              {data.data.recentScans.length === 0 ? (
                <EmptyState icon={<ScanLine strokeWidth={1.7} />} title="No scans yet." body="Your scans in the Buzz app show here." className="border-0 py-6" />
              ) : (
                <ul className="flex flex-col gap-2" aria-label="Recent scans">
                  {data.data.recentScans.map((s) => (
                    <li key={`${s.trackingId}-${s.at}`}>
                      <Bubble variant="system" sender={{ name: s.trackingId, system: "buzz" }} time={formatTime(s.at)}>
                        {s.label}. {s.city}.
                      </Bubble>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <TestNote>Test build: &ldquo;today&rdquo; is the test data&apos;s date, {formatDate(PORTAL_NOW)}. Scanning happens in the Buzz app.</TestNote>
        </div>
      )}
    </div>
  );
}
