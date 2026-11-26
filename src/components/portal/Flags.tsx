"use client";

import { useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Flag, TriangleAlert } from "lucide-react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { FilterChips, FLAG_EXPLAINED } from "@/components/logistics/ops";
import { formatDayTime, listPortalFlags, PortalError, reviewFlag, type CompanyFlag } from "@/lib/data";
import { cn } from "@/lib/cn";
import { AccessDenied, PageHeader } from "./ui";
import { usePortal, useLoad } from "./session";

type Show = "open" | "reviewed" | "all";

/**
 * Flags (DESIGN.md §10.2): off-route, wrong-company scan, 48h silence,
 * delivered without code, manual entry. Each has a review action: say what
 * you found, and it's marked reviewed (and logged).
 */
export function PortalFlags() {
  const { session, can } = usePortal();
  const [show, setShow] = useState<Show>("open");
  const allowed = can("view_flags");
  const data = useLoad(() => (allowed ? listPortalFlags(session) : Promise.resolve([])), [session.staffId, allowed]);
  if (!allowed) return <AccessDenied what="see flags" />;

  const rows = (data.data ?? []).filter((f) => (show === "all" ? true : show === "open" ? f.status === "open" : f.status !== "open"));

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <PageHeader title="Flags" meta="Things the scan log noticed. Review each one so the record shows what happened." />
      <div className="mb-4">
        <FilterChips
          label="Show"
          value={show}
          onChange={setShow}
          options={[
            { key: "open", label: "Open", count: data.data?.filter((f) => f.status === "open").length },
            { key: "reviewed", label: "Reviewed" },
            { key: "all", label: "All" },
          ]}
        />
      </div>
      {data.state === "error" ? (
        <EmptyState title="Flags didn't load." body="Check your connection, then refresh." />
      ) : data.state === "loading" ? (
        <Skeleton className="h-40 w-full" />
      ) : data.data.length === 0 ? (
        <EmptyState icon={<Flag strokeWidth={1.7} />} title="No flags. Your riders' scans look clean." />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Flag strokeWidth={1.7} />} title={show === "open" ? "Nothing to review right now." : "No reviewed flags yet."} />
      ) : (
        <ul className="divide-y divide-line rounded-field border border-line bg-white">
          {rows.map((f) => (
            <FlagRow key={f.id} flag={f} canReview={can("review_flag")} onReviewed={data.reload} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FlagRow({ flag: f, canReview, onReviewed }: { flag: CompanyFlag; canReview: boolean; onReviewed: () => void }) {
  const { session } = usePortal();
  const toast = useToast();
  const [reviewing, setReviewing] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const x = FLAG_EXPLAINED[f.type];
  const open = f.status === "open";
  const noteId = `note-${f.id}`;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await reviewFlag(session, f.id, note);
      toast({ title: "Flag reviewed", description: `${x.title} on ${f.trackingId} is marked reviewed.` });
      onReviewed();
    } catch (err) {
      setError(err instanceof PortalError ? (err.fields?.note ?? err.message) : "That didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex gap-3 px-5 py-4">
      {open ? (
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warn-700" strokeWidth={1.8} />
      ) : (
        <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ok-700" strokeWidth={1.8} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-ui font-semibold text-ink-900">{x.title}</p>
          <p className={open ? "text-meta font-medium text-warn-700" : "text-meta text-ok-700"}>{open ? "Open" : "Reviewed"}</p>
        </div>
        <p className="mt-1 text-ui text-ink-900">{f.label}</p>
        <p className="mt-1.5 text-meta text-ink-500">
          {f.riderName}, <span className="code-text">{f.trackingId}</span>, {formatDayTime(f.raisedAt)}
        </p>
        {f.review && (
          <p className="mt-2 rounded-field bg-mist px-3 py-2 text-ui text-ink-700">
            {f.review.note} <span className="text-meta text-ink-500">({f.review.by}, {formatDayTime(f.review.at)})</span>
          </p>
        )}
        {open && canReview && !reviewing && (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setReviewing(true)}>
            Review
          </Button>
        )}
        {reviewing && (
          <form onSubmit={submit} noValidate className="mt-3 flex flex-col gap-2">
            <label htmlFor={noteId} className="text-[14px] font-semibold text-ink-900">
              What did you find?
            </label>
            <input
              id={noteId}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${noteId}-error` : undefined}
              placeholder="e.g. Rider took a detour around a closed road"
              className={cn(
                "h-13 w-full rounded-field border-[1.5px] bg-white px-4 text-[16px] text-ink-900 placeholder:text-ink-500 hover:border-ink-500 focus:outline-3 focus:outline-offset-3 focus:outline-sky-400",
                error ? "border-alert-600" : "border-line-strong",
              )}
            />
            {error && (
              <p id={`${noteId}-error`} className="flex items-start gap-1.5 text-[14px] text-alert-700">
                <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" loading={busy}>
                Mark reviewed
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => (setReviewing(false), setError(null))}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </li>
  );
}
