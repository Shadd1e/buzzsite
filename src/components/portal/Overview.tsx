"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleAlert, Clock, Flag, TriangleAlert, UserPlus } from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { ButtonLink } from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import {
  getFleetStats,
  listActivity,
  listCompanyFlags,
  listCompanyRiders,
  listStops,
  PORTAL_NOW,
} from "@/lib/data";
import { formatDate, formatDayTime, formatPercent, formatTime } from "@/lib/data/format";
import type { Stop } from "@/lib/data/types";
import { DailyBars, PageHeader, Panel, RunLine, StatStrip } from "./ui";
import { usePortal, useLoad } from "./session";

const dayName = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "Africa/Lagos" });

/**
 * Overview (DESIGN.md §10.2): today's numbers, each rider's run, what needs
 * attention, deliveries over two weeks. Super admins also see recent activity.
 */
export function Overview() {
  const { session, staff, can } = usePortal();
  const denied = useSearchParams().get("denied");

  const data = useLoad(
    () =>
      Promise.all([
        listCompanyRiders(session),
        listStops(session),
        listCompanyFlags(session),
        getFleetStats(session, 14),
        can("view_activity") ? listActivity(session) : Promise.resolve([]),
      ]),
    [session.staffId],
  );

  const first = staff.name.split(" ")[0];
  const header = (
    <PageHeader
      title="Today"
      meta={`${dayName.format(new Date(PORTAL_NOW))} ${formatDate(PORTAL_NOW)}. Signed in as ${first}.`}
      actions={
        can("register_rider") && (
          <ButtonLink href="/logistics/portal/riders/new" size="sm" icon={<UserPlus aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
            Add rider
          </ButtonLink>
        )
      }
    />
  );

  if (data.state === "loading") {
    return (
      <>
        {header}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-field border border-line bg-line sm:grid-cols-5" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3 bg-white px-5 py-5">
              <Skeleton className="w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (data.state === "error") {
    return (
      <>
        {header}
        <Panel>
          <p role="alert" className="flex items-center gap-2 text-ui text-ink-900">
            <CircleAlert aria-hidden="true" className="size-5 text-alert-700" strokeWidth={1.8} />
            The overview didn&apos;t load. Check your connection, then reload the page.
          </p>
        </Panel>
      </>
    );
  }

  const [riders, stops, flags, fleet, activity] = data.data;
  const active = riders.filter((r) => r.status === "active");
  const pending = riders.filter((r) => r.status === "pending_verification");
  const openFlags = flags.filter((f) => f.status === "open");
  const stopsByRider = new Map<string, Stop[]>();
  for (const s of stops) stopsByRider.set(s.riderId, [...(stopsByRider.get(s.riderId) ?? []), s]);
  const doneStops = stops.filter((s) => s.status === "done").length;
  const failedStops = stops.filter((s) => s.status === "failed");
  const onRoad = active.filter((r) => stopsByRider.get(r.id)?.some((s) => s.status === "current"));
  const today = fleet.daily.at(-1);
  const statsById = new Map(fleet.riders.map((r) => [r.riderId, r]));
  const noRun = active.filter((r) => !stopsByRider.has(r.id));

  const attention = [
    ...pending.map((r) => ({
      key: r.id,
      icon: <Clock aria-hidden="true" className="size-4 text-warn-700" strokeWidth={1.8} />,
      title: `${r.name} is waiting for verification`,
      body: "They can't sign in to the app until your company confirms them.",
      href: `/logistics/portal/riders/${r.id}`,
      action: "Verify",
    })),
    ...failedStops.map((s) => {
      const rider = riders.find((r) => r.id === s.riderId);
      return {
        key: s.id,
        icon: <TriangleAlert aria-hidden="true" className="size-4 text-warn-700" strokeWidth={1.8} />,
        title: `Failed attempt in ${s.place}`,
        body: `${rider?.name ?? "Rider"} · ${s.note ?? "No reason given"} · ${formatTime(s.doneAt ?? s.plannedAt)}`,
        href: `/logistics/portal/stops?rider=${s.riderId}`,
        action: "See run",
      };
    }),
    ...openFlags.map((f) => ({
      key: f.id,
      icon: <Flag aria-hidden="true" className="size-4 text-alert-700" strokeWidth={1.8} />,
      title: f.label,
      body: `${f.trackingId} · raised ${formatDayTime(f.raisedAt)}`,
      // A flag can name another company's rider (wrong-company scan): no link then
      href: riders.some((r) => r.id === f.riderId) ? `/logistics/portal/riders/${f.riderId}` : undefined,
      action: "Open rider",
    })),
  ];

  return (
    <>
      {header}

      {denied && (
        <p role="status" className="mb-5 flex items-start gap-2 rounded-field border border-line bg-white px-4 py-3 text-ui text-ink-700">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-600" strokeWidth={1.8} />
          That screen is for super admins. You&apos;re back on your overview.
        </p>
      )}

      <StatStrip
        items={[
          { label: "Riders on the road", value: onRoad.length, note: `of ${active.length} active` },
          { label: "Stops done", value: doneStops, note: `of ${stops.length} planned today` },
          { label: "Delivered today", value: today?.delivered ?? 0, note: "so far" },
          { label: "Failed attempts", value: failedStops.length, note: "today" },
          { label: "Open flags", value: openFlags.length, note: openFlags.length ? "review below" : "all clear" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          title="Riders today"
          action={
            <Link href="/logistics/portal/stops" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-blue-700 hover:underline">
              All stops
            </Link>
          }
          bodyClassName="p-0"
        >
          {active.length === 0 ? (
            <p className="px-5 py-10 text-center text-ui text-ink-500">
              No active riders yet. Add your first rider to give them a rider code.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {active.map((r) => {
                const run = stopsByRider.get(r.id) ?? [];
                const current = run.find((s) => s.status === "current");
                const done = run.filter((s) => s.status === "done" || s.status === "failed").length;
                const st = statsById.get(r.id);
                return (
                  <li key={r.id} className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-blue-50 sm:grid-cols-[auto_minmax(0,180px)_minmax(0,1fr)_auto]">
                    <Avatar sender={{ name: r.name }} size="lg" decorative />
                    <div className="min-w-0">
                      <Link
                        href={`/logistics/portal/riders/${r.id}`}
                        className="block truncate text-ui font-semibold text-ink-900 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:-outline-offset-3 focus-visible:after:outline-sky-400"
                      >
                        {r.name}
                      </Link>
                      <p className="truncate text-meta text-ink-500">
                        {current ? `Heading to ${current.place}` : run.length ? "Run finished" : "No run today"}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      {run.length ? <RunLine stops={run} /> : <span className="text-meta text-ink-500">Not on a run</span>}
                    </div>
                    <p className="col-span-2 flex gap-4 text-meta text-ink-500 tabular-nums sm:col-span-1 sm:flex-col sm:gap-0 sm:text-right">
                      <span>
                        <span className="text-ui font-medium text-ink-900">{done}</span>/{run.length} stops
                      </span>
                      <span>{formatPercent(st?.successRate ?? null)} success, 14 days</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          {noRun.length > 0 && (
            <p className="border-t border-line px-5 py-3 text-meta text-ink-500">
              Not on a run today: {noRun.map((r) => r.name).join(", ")}
            </p>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Needs attention" bodyClassName="p-0">
            {attention.length === 0 ? (
              <p className="px-5 py-8 text-center text-ui text-ink-500">Nothing needs you right now.</p>
            ) : (
              <ul className="divide-y divide-line">
                {attention.map((a) => (
                  <li key={a.key} className="flex gap-3 px-5 py-3.5">
                    <span className="mt-0.5">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-ui text-ink-900">{a.title}</p>
                      <p className="text-meta text-ink-500">{a.body}</p>
                    </div>
                    {a.href && (
                      <Link href={a.href} className="inline-flex min-h-11 shrink-0 items-center self-center text-[14px] font-semibold text-blue-700 hover:underline">
                        {a.action}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {can("view_activity") && (
            <Panel
              title="Recent activity"
              action={
                <Link href="/logistics/portal/team?tab=activity" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-blue-700 hover:underline">
                  Activity log
                </Link>
              }
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-line">
                {activity.slice(0, 5).map((a) => (
                  <li key={a.id} className="px-5 py-3">
                    <p className="text-ui text-ink-900">{a.summary}</p>
                    <p className="text-meta text-ink-500">
                      {a.actorName} · {formatDayTime(a.at)}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>

      <Panel title="Deliveries, last 14 days" className="mt-6">
        <DailyBars days={fleet.daily} label="Company deliveries and failed attempts per day, last 14 days" />
        <p className="mt-4 text-meta text-ink-500">
          {fleet.fleet.delivered} parcels delivered. {formatPercent(fleet.fleet.successRate)} of attempts succeeded and{" "}
          {formatPercent(fleet.fleet.onTimeRate)} arrived on time.
        </p>
      </Panel>
    </>
  );
}
