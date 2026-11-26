"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, CircleCheck, Circle, Flag, RotateCcw, ShieldCheck, Smartphone } from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Chip } from "@/components/Chip";
import { Code } from "@/components/Code";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { Skeleton } from "@/components/Skeleton";
import { StatusPill } from "@/components/StatusPill";
import { useToast } from "@/components/Toast";
import {
  deactivateRider,
  DEACTIVATION_REASONS,
  getCompanyRider,
  getFleetStats,
  getRiderActivity,
  getVerificationChecklist,
  listCompanyFlags,
  listRiderHistory,
  listRiderParcels,
  listStops,
  PortalError,
  reactivateRider,
  summariseRiderDays,
  verifyRider,
} from "@/lib/data";
import { formatDate, formatDayTime, formatPercent, formatTime, maskPhone } from "@/lib/data/format";
import { cn } from "@/lib/cn";
import { DailyBars, Panel, RiderStatusPill, RunLine, StatStrip, StopStatusTag } from "./ui";
import { usePortal, useLoad } from "./session";

/**
 * Rider profile (DESIGN.md §10.2): details, performance over 7 or 14 days
 * against the company average, today's run, verification record, parcels,
 * flags, history, and Deactivate rider (danger, confirm, history kept).
 */
export function RiderProfile({ riderId }: { riderId: string }) {
  const { session, can } = usePortal();
  const toast = useToast();
  const [period, setPeriod] = useState<7 | 14>(7);
  const [confirmOff, setConfirmOff] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string>();
  const [confirmOn, setConfirmOn] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const data = useLoad(async () => {
    const rider = await getCompanyRider(session, riderId);
    if (!rider) return null;
    const [days, fleet, stops, parcels, flags, history, checklist] = await Promise.all([
      getRiderActivity(session, riderId),
      getFleetStats(session, 14),
      listStops(session, { riderId }),
      listRiderParcels(session, riderId),
      listCompanyFlags(session),
      listRiderHistory(session, riderId),
      getVerificationChecklist(session),
    ]);
    return { rider, days, fleet, stops, parcels, flags: flags.filter((f) => f.riderId === riderId), history, checklist };
  }, [session.staffId, riderId]);

  if (data.state === "loading") {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <span className="sr-only" role="status">Loading rider</span>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="w-80" />
        <Skeleton className="mt-4 h-24 w-full rounded-field" />
      </div>
    );
  }
  if (data.state === "error" || !data.data) {
    return (
      <EmptyState
        title="We couldn't find that rider in your company."
        body="They may belong to another company, or the link is wrong."
        action={
          <ButtonLink href="/logistics/portal/riders" variant="outline" size="sm">
            Back to riders
          </ButtonLink>
        }
      />
    );
  }

  const { rider, days, fleet, stops, parcels, flags, history, checklist } = data.data;
  const stats = summariseRiderDays(rider.id, days, period);
  const fleetWindow = summariseRiderDays("fleet", fleet.daily, period);
  const fleetRiders = fleet.riders.length || 1;
  const fleetAvgPerRider = fleetWindow.delivered / fleetRiders / Math.max(fleetWindow.days, 1);
  const recent = days.slice(-period);
  const canDeactivate = can("deactivate_rider") && (rider.status === "active" || rider.status === "pending_verification");

  async function doDeactivate() {
    if (!reason) {
      setReasonError("Choose a reason.");
      throw new Error("reason required"); // ConfirmDialog stays open on a throw
    }
    await deactivateRider(session, rider.id, reason);
    toast({ title: "Rider deactivated", description: `${rider.name} can't sign in or scan. Their history is kept.` });
    setReason("");
    data.reload();
  }

  async function doReactivate() {
    await reactivateRider(session, rider.id);
    toast({ title: "Rider reactivated", description: `${rider.name}'s rider code works again.` });
    data.reload();
  }

  return (
    <>
      <p className="mb-3 text-meta">
        <Link href="/logistics/portal/riders" className="inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
          Riders
        </Link>
      </p>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar sender={{ name: rider.name }} size="xl" decorative />
          <div className="min-w-0">
            <h1 className="text-page-title text-ink-900">{rider.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <RiderStatusPill status={rider.status} />
              <span className="text-ui text-ink-700">{rider.vehicle}</span>
              <span className="text-ui text-ink-500">Joined {formatDate(rider.joined)}</span>
              <span className={cn("inline-flex items-center gap-1 text-ui", rider.appSignedIn ? "text-ok-700" : "text-ink-500")}>
                <Smartphone aria-hidden="true" className="size-4" strokeWidth={1.8} />
                {rider.appSignedIn ? "Signed in to the app" : "Not signed in to the app"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Code value={rider.riderCode} label="Rider code" size="sm" showLabel />
          {rider.status === "pending_verification" && can("verify_rider") && (
            <Button size="sm" onClick={() => setVerifyOpen(true)} icon={<ShieldCheck aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
              Finish verification
            </Button>
          )}
          {rider.status === "deactivated" && can("reactivate_rider") && (
            <Button size="sm" variant="outline" onClick={() => setConfirmOn(true)} icon={<RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
              Reactivate rider
            </Button>
          )}
        </div>
      </div>

      {rider.status === "deactivated" && (
        <p className="mb-6 rounded-field border border-line bg-white px-4 py-3 text-ui text-ink-700">
          Deactivated on {rider.deactivatedAt ? formatDate(rider.deactivatedAt) : "an earlier date"}
          {rider.deactivatedReason ? `: ${rider.deactivatedReason}` : ""}. Their rider code doesn&apos;t work in the app.
          {!can("reactivate_rider") && " Only a super admin can reactivate them."}
        </p>
      )}
      {rider.status === "frozen" && (
        <p className="mb-6 rounded-field border border-line bg-white px-4 py-3 text-ui text-ink-700">
          Buzz has frozen this rider while a review is open. Contact partner support to change this.
        </p>
      )}

      {/* Performance */}
      <section aria-labelledby="perf" className="mb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="perf" className="text-section-title text-ink-900">
            Performance
          </h2>
          <div className="flex gap-2" role="group" aria-label="Period">
            <Chip selected={period === 7} onClick={() => setPeriod(7)}>
              7 days
            </Chip>
            <Chip selected={period === 14} onClick={() => setPeriod(14)}>
              14 days
            </Chip>
          </div>
        </div>
        {days.length === 0 ? (
          <EmptyState
            title="No deliveries yet."
            body={
              rider.status === "pending_verification"
                ? "Performance appears once they're verified and start scanning."
                : "Performance appears after their first scan in the app."
            }
          />
        ) : (
          <>
            <StatStrip
              items={[
                { label: "Delivered", value: stats.delivered, note: `${stats.avgPerDay.toFixed(1)} a day (company ${fleetAvgPerRider.toFixed(1)})` },
                { label: "Success rate", value: formatPercent(stats.successRate), note: `company ${formatPercent(fleetWindow.successRate)}` },
                { label: "On time", value: formatPercent(stats.onTimeRate), note: `company ${formatPercent(fleetWindow.onTimeRate)}` },
                { label: "Failed attempts", value: stats.failed, note: `in ${stats.days} days` },
                { label: "Distance", value: `${stats.km.toLocaleString("en-NG")} km`, note: `${stats.scans} scans` },
                { label: "Buyer rating", value: rider.rating === null ? "–" : rider.rating.toFixed(1), note: "out of 5" },
              ]}
            />
            <Panel className="mt-4">
              <DailyBars days={recent} label={`${rider.name}: deliveries and failed attempts per day, last ${period} days`} />
            </Panel>
          </>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <Panel
            title="Today's run"
            action={
              stops.length > 0 && (
                <Link href={`/logistics/portal/stops?rider=${rider.id}`} className="inline-flex min-h-11 items-center text-[14px] font-semibold text-blue-700 hover:underline">
                  Open in stops
                </Link>
              )
            }
          >
            {stops.length === 0 ? (
              <p className="text-ui text-ink-500">Not on a run today.</p>
            ) : (
              <>
                <RunLine stops={stops} size="md" />
                <ol className="mt-5 divide-y divide-line">
                  {stops.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0">
                        <span className="block truncate text-ui text-ink-900">
                          <span className="mr-2 text-ink-500 tabular-nums">{formatTime(s.doneAt ?? s.plannedAt)}</span>
                          {s.place}
                        </span>
                        {s.note && <span className="block text-meta text-warn-700">{s.note}</span>}
                      </span>
                      <StopStatusTag status={s.status} />
                    </li>
                  ))}
                </ol>
              </>
            )}
          </Panel>

          <Panel title="Parcels" bodyClassName="p-0">
            {parcels.length === 0 ? (
              <p className="px-5 py-6 text-ui text-ink-500">No parcels assigned in the test data.</p>
            ) : (
              <ul className="divide-y divide-line">
                {parcels.map((p) => (
                  <li key={p.trackingId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3">
                    <span className="min-w-0">
                      <span className="code-text block text-ui text-ink-900">{p.trackingId}</span>
                      <span className="block text-meta text-ink-500">
                        {p.route.join(" to ")}, for {p.receiver.name}
                      </span>
                    </span>
                    <StatusPill status={p.status} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Details">
            <dl className="flex flex-col gap-3 text-ui">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Mobile number</dt>
                <dd className="text-ink-900 tabular-nums">{maskPhone(rider.phone)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Scans today</dt>
                <dd className="text-ink-900 tabular-nums">{rider.scansToday}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Verification record">
            <ul className="flex flex-col gap-2">
              {rider.verification.companyChecks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-ui">
                  {c.done ? (
                    <CircleCheck aria-hidden="true" className="size-4 text-ok-700" strokeWidth={1.8} />
                  ) : (
                    <Circle aria-hidden="true" className="size-4 text-ink-500" strokeWidth={1.8} />
                  )}
                  <span className={c.done ? "text-ink-900" : "text-ink-500"}>
                    {c.label}
                    <span className="sr-only">{c.done ? ": done" : ": not done"}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-meta text-ink-500">
              {rider.verification.confirmedByCompany
                ? "Your company confirmed this rider is verified."
                : "Not yet confirmed by your company."}
            </p>
          </Panel>

          {flags.length > 0 && (
            <Panel title="Flags" bodyClassName="p-0">
              <ul className="divide-y divide-line">
                {flags.map((f) => (
                  <li key={f.id} className="flex gap-3 px-5 py-3">
                    <Flag aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-alert-700" strokeWidth={1.8} />
                    <span>
                      <span className="block text-ui text-ink-900">{f.label}</span>
                      <span className="block text-meta text-ink-500">
                        <span className="code-text">{f.trackingId}</span>, {formatDayTime(f.raisedAt)}, {f.status}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="History" bodyClassName="p-0">
            {history.length === 0 ? (
              <p className="px-5 py-6 text-ui text-ink-500">No changes recorded since they joined.</p>
            ) : (
              <ul className="divide-y divide-line">
                {history.map((h) => (
                  <li key={h.id} className="px-5 py-3">
                    <p className="text-ui text-ink-900">{h.summary}</p>
                    <p className="text-meta text-ink-500">
                      {h.actorName}, {formatDayTime(h.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {canDeactivate && (
            <section aria-labelledby="deactivate" className="rounded-field border border-alert-600/30 bg-white p-5">
              <h2 id="deactivate" className="text-section-title text-ink-900">
                Deactivate rider
              </h2>
              <p className="mt-1 text-ui text-ink-700">
                They&apos;re signed out of the app and can&apos;t scan. Their history stays.
                {!can("reactivate_rider") && " Only a super admin can undo this."}
              </p>
              <Button variant="danger" size="sm" className="mt-4" onClick={() => setConfirmOff(true)} icon={<Ban aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
                Deactivate rider
              </Button>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOff}
        onOpenChange={(o) => {
          setConfirmOff(o);
          if (!o) setReasonError(undefined);
        }}
        title={`Deactivate ${rider.name}?`}
        description="They can't sign in or scan parcels. Their history is kept, and the action is logged with your name."
        confirmLabel="Deactivate rider"
        onConfirm={doDeactivate}
      >
        <Field label="Reason" error={reasonError}>
          {(p) => (
            <Select
              {...p}
              value={reason}
              onValueChange={(v) => {
                setReason(v);
                setReasonError(undefined);
              }}
              options={DEACTIVATION_REASONS.map((r) => ({ value: r, label: r }))}
              placeholder="Choose a reason"
            />
          )}
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmOn}
        onOpenChange={setConfirmOn}
        tone="default"
        title={`Reactivate ${rider.name}?`}
        description={
          rider.verification.confirmedByCompany
            ? "Their rider code works again straight away."
            : "They go back to pending verification until your checks are done."
        }
        confirmLabel="Reactivate rider"
        onConfirm={doReactivate}
      />

      <VerifyDrawer
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        riderName={rider.name}
        checklist={checklist}
        initial={rider.verification.companyChecks}
        onSubmit={async (checks, confirmed) => {
          try {
            await verifyRider(session, rider.id, { checks, confirmed });
            toast({ title: "Rider verified", description: `${rider.name} can now sign in with their rider code.` });
            setVerifyOpen(false);
          } catch (e) {
            toast({ tone: e instanceof PortalError && e.code === "invalid" ? "info" : "error", title: "Progress saved", description: e instanceof Error ? e.message : undefined });
          }
          data.reload();
        }}
      />
    </>
  );
}

function VerifyDrawer({
  open,
  onOpenChange,
  riderName,
  checklist,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  riderName: string;
  checklist: string[];
  initial: Array<{ label: string; done: boolean }>;
  onSubmit: (checks: Array<{ label: string; done: boolean }>, confirmed: boolean) => Promise<void>;
}) {
  const [done, setDone] = useState<Record<string, boolean>>(() => Object.fromEntries(initial.map((c) => [c.label, c.done])));
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const all = checklist.every((c) => done[c]);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Finish verification"
      description={`Your company's checks for ${riderName}`}
      footer={
        <>
          <Button
            loading={busy}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onSubmit(
                checklist.map((label) => ({ label, done: !!done[label] })),
                confirmed && all,
              );
              setBusy(false);
            }}
          >
            {confirmed && all ? "Verify rider" : "Save progress"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="divide-y divide-line">
        {checklist.map((c) => (
          <Checkbox key={c} label={c} checked={!!done[c]} onCheckedChange={(v) => setDone((d) => ({ ...d, [c]: v === true }))} />
        ))}
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <Checkbox
          label="We have verified this rider"
          description={all ? "Recorded with your name." : "Tick every check first."}
          checked={confirmed && all}
          disabled={!all}
          onCheckedChange={(v) => setConfirmed(v === true)}
        />
      </div>
    </Drawer>
  );
}
