"use client";

import { useEffect, useState } from "react";
import { Check, CircleAlert } from "lucide-react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Skeleton } from "@/components/Skeleton";
import { getReviewStatus, listInspectionSlots, PortalError, rescheduleInspection, type ReviewStatus as Status } from "@/lib/data";
import { formatDate, formatDateTime, formatTime } from "@/lib/data/format";
import { logisticsAccount } from "@/content/logistics";
import { cn } from "@/lib/cn";
import { useAccount } from "./session";

const c = logisticsAccount.review;
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

type StepState = "done" | "current" | "upcoming";

/**
 * Review status (DESIGN.md §10.1): what a pending company or individual rider
 * sees after sign in. A short headline, a vertical checklist (received →
 * documents → inspection booked, with Reschedule → passed, with score →
 * live), what's inspected, and a contact line. No other navigation.
 */
export function ReviewStatus() {
  const { session, signOut } = useAccount();
  const [status, setStatus] = useState<Status | null>(null);
  const [failed, setFailed] = useState(false);
  const [moved, setMoved] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getReviewStatus(session)
      .then((s) => live && setStatus(s))
      .catch((e) => {
        if (!live) return;
        // The account changed since sign in (deactivated, or approved): sign in again
        if (e instanceof PortalError && e.code === "forbidden") signOut("account_changed");
        else setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [session, signOut]);

  if (failed) {
    return (
      <Page>
        <p role="alert" className="flex items-start gap-2 text-[15px] text-alert-700">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
          {c.error}
        </p>
      </Page>
    );
  }
  if (!status) {
    return (
      <Page>
        <div aria-busy="true" className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="mt-6 h-64 w-full" />
        </div>
      </Page>
    );
  }

  const r = status.review;
  const docsDone = r.documents === "checked";
  const booked = !!r.inspection;
  const passed = r.score !== null;
  const done = [true, docsDone, booked, passed, false];
  const firstOpen = done.indexOf(false);
  const state = (i: number): StepState => (done[i] ? "done" : i === firstOpen ? "current" : "upcoming");

  return (
    <Page>
      <h1 className="text-[28px] leading-tight font-medium tracking-[-0.01em] text-ink-900">{c.title}</h1>
      <p className="mt-2 max-w-[36em] text-[15px] leading-relaxed text-ink-700">
        {status.kind === "company" ? fill(c.intro.company, { company: status.company ?? "" }) : c.intro.individual}
      </p>

      {moved && (
        <p role="status" className="mt-6 flex items-start gap-2 rounded-field bg-ok-50 px-4 py-3 text-[14px] text-ink-900">
          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ok-700" strokeWidth={2} />
          {fill(c.moved, { date: formatDateTime(moved) })}
        </p>
      )}

      <section aria-labelledby="steps-title" className="mt-8 rounded-field border border-line bg-white p-5 md:p-6">
        <h2 id="steps-title" className="sr-only">
          {c.stepsLabel}
        </h2>
        <ol>
          <Step state={state(0)} lineDone={done[0] && done[1]} title={c.steps.received} last={false}>
            {fill(c.receivedOn, { date: formatDate(r.receivedAt) })}
          </Step>
          <Step state={state(1)} lineDone={done[1] && done[2]} title={c.steps.documents} last={false}>
            {docsDone && r.documentsCheckedAt ? fill(c.checkedOn, { date: formatDate(r.documentsCheckedAt) }) : c.checking}
          </Step>
          <Step state={state(2)} lineDone={done[2] && done[3]} title={c.steps.booked} last={false}>
            {r.inspection ? (
              <div className="flex flex-col items-start gap-2">
                <p>
                  <span className="font-semibold text-ink-900">{formatDateTime(r.inspection.at)}</span>
                  <span className="block">{r.inspection.place}</span>
                </p>
                {!passed && <Reschedule current={r.inspection.at} onMoved={(review) => (setStatus({ ...status, review }), setMoved(review.inspection!.at))} />}
              </div>
            ) : (
              c.notBooked
            )}
          </Step>
          <Step state={state(3)} lineDone={done[3] && done[4]} title={c.steps.passed} last={false}>
            {passed ? fill(c.score, { score: r.score! }) : c.scoreLater}
          </Step>
          <Step state={state(4)} title={c.steps.live} last>
            {status.kind === "company" ? c.live.company : c.live.individual}
          </Step>
        </ol>
      </section>

      <section aria-labelledby="inspected-title" className="mt-8">
        <h2 id="inspected-title" className="text-[18px] font-semibold text-ink-900">
          {c.inspectedTitle}
        </h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {(status.kind === "company" ? c.inspected.company : c.inspected.individual).map((item) => (
            <li key={item} className="py-3 text-[15px] text-ink-700">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-[14px] text-ink-700">
        {c.contact.before}{" "}
        <a href={c.contact.href} className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700">
          {c.contact.label}
        </a>
      </p>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[640px]">{children}</div>;
}

/** One checklist row: a marker on a connecting line, the title and a detail line */
/** The line below a step is green only when both steps it joins are done */
function Step({ state, title, last, lineDone = false, children }: { state: StepState; title: string; last: boolean; lineDone?: boolean; children: React.ReactNode }) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0" aria-current={state === "current" ? "step" : undefined}>
      {!last && <span aria-hidden="true" className={cn("absolute top-7 bottom-1 left-[13px] w-0.5", lineDone ? "bg-ok-600" : "bg-line")} />}
      <span
        aria-hidden="true"
        className={cn(
          "relative grid size-7 shrink-0 place-items-center rounded-full",
          state === "done" && "bg-ok-600 text-white",
          state === "current" && "border-2 border-blue-600 bg-white",
          state === "upcoming" && "border-2 border-line-strong bg-white",
        )}
      >
        {state === "done" && <Check className="size-4" strokeWidth={2.5} />}
        {state === "current" && <span className="size-2.5 rounded-full bg-blue-600" />}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className={cn("text-[15px] font-semibold", state === "upcoming" ? "text-ink-500" : "text-ink-900")}>
          {title}
          <span className="sr-only">{state === "done" ? " (done)" : state === "current" ? " (in progress)" : " (to come)"}</span>
        </p>
        <div className="mt-1 text-[14px] leading-relaxed text-ink-700">{children}</div>
      </div>
    </li>
  );
}

/** Move the inspection to another offered slot */
function Reschedule({ current, onMoved }: { current: string; onMoved: (review: Status["review"]) => void }) {
  const { session } = useAccount();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const days = slots.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.slice(0, 10)] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          setPick(null);
          setError(null);
          setOpen(true);
          setSlots((await listInspectionSlots(session)).filter((s) => s !== current));
        }}
      >
        {c.reschedule}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="default"
        title={c.dialog.title}
        description={c.dialog.description}
        confirmLabel={c.dialog.confirm}
        cancelLabel={c.dialog.cancel}
        onConfirm={async () => {
          if (!pick) {
            setError(c.dialog.pick);
            throw new Error("no slot");
          }
          try {
            onMoved(await rescheduleInspection(session, pick));
          } catch (e) {
            setError(e instanceof PortalError ? e.message : c.error);
            throw e;
          }
        }}
      >
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">{c.dialog.slotsLabel}</legend>
          {Object.entries(days).map(([day, times]) => (
            <div key={day}>
              <p className="text-[13px] font-medium text-ink-700">{formatDate(times[0])}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {times.map((t) => (
                  <Chip key={t} selected={pick === t} onClick={() => (setPick(t), setError(null))}>
                    <span className="tabular-nums">{formatTime(t)}</span>
                  </Chip>
                ))}
              </div>
            </div>
          ))}
          {error && (
            <p role="alert" className="flex items-start gap-1.5 text-[14px] text-alert-700">
              <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
              {error}
            </p>
          )}
        </fieldset>
      </ConfirmDialog>
    </>
  );
}
