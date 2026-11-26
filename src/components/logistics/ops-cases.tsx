"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Image as ImageIcon } from "lucide-react";
import { Bubble } from "@/components/chat";
import { Button } from "@/components/Button";
import { StatusPill } from "@/components/StatusPill";
import { Panel } from "@/components/portal/ui";
import { cn } from "@/lib/cn";
import { formatDayTime, formatNaira, formatTime } from "@/lib/data/format";
import { PORTAL_NOW, PortalError } from "@/lib/data";
import type { Batch, Dispute } from "@/lib/data/types";
import { Facts, Timeline } from "./ops";

/* ---------- batches (shared by the partner and rider portals) ---------- */

/** Mother card, child parcels (unlinked ones say where and when) and history. Read-only. */
export function BatchDetail({ batch: b, extraRows = [] }: { batch: Batch; extraRows?: Array<[string, ReactNode]> }) {
  return (
    <div className="flex flex-col gap-6">
      <Panel title="Mother card" bodyClassName="px-5 py-2">
        <Facts
          rows={[
            ["Mother code", <span key="m" className="code-text">{b.id}</span>],
            ...extraRows,
            ["Route", b.route.join(", ")],
            ["Last location", `${b.lastScan.city}, ${formatDayTime(b.lastScan.at)}`],
            ...(b.openedAt ? ([["Opened", formatDayTime(b.openedAt)]] as Array<[string, string]>) : []),
            ...(b.closedAt ? ([["Closed", formatDayTime(b.closedAt)]] as Array<[string, string]>) : []),
          ]}
        />
      </Panel>

      <section aria-labelledby="children-title">
        <h3 id="children-title" className="mb-2 text-section-title text-ink-900">
          Parcels in this batch
        </h3>
        <ul className="divide-y divide-line rounded-field border border-line">
          {b.children.map((c) => (
            <li key={c.trackingId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="code-text text-ui text-ink-900">{c.trackingId}</span>
              <span className="flex flex-col items-end gap-1">
                <StatusPill status={c.status} size="sm" />
                {c.unlinkedAt && (
                  <span className="text-meta text-ink-500">
                    Unlinked at {c.unlinkedAt}
                    {c.unlinkedTime ? `, ${formatDayTime(c.unlinkedTime)}` : ""}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="bhistory-title">
        <h3 id="bhistory-title" className="mb-3 text-section-title text-ink-900">
          History
        </h3>
        {b.history && b.history.length > 0 ? (
          <Timeline events={b.history.map((h) => ({ label: h.event, city: h.city, at: h.at }))} />
        ) : (
          <p className="text-ui text-ink-500">No batch events recorded yet.</p>
        )}
      </section>
    </div>
  );
}

/* ---------- disputes & claims (shared) ---------- */

export type CaseWithResponse = Dispute & { response: { text: string; at: string; by?: string } | null };

/** "2 days 20 h left" against the fixtures' clock */
export function timeLeft(endsAt: string): { text: string; urgent: boolean } {
  const ms = Date.parse(endsAt) - Date.parse(PORTAL_NOW);
  if (ms <= 0) return { text: "Window closed", urgent: false };
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  return { text: d > 0 ? `${d} day${d === 1 ? "" : "s"} ${h % 24} h left` : `${h} h left`, urgent: h < 48 };
}

export const CASE_STATUS: Record<Dispute["status"], string> = {
  open: "Open",
  awaiting_partner: "Waiting for you",
  awaiting_seller: "Waiting for the seller",
  resolved: "Decided",
};
const DECISION_LABEL = { release: "Released to the seller", refund: "Refunded to the buyer", partial_refund: "Partly refunded" } as const;
const FAULT_LABEL = { buzz: "Buzz (Buzz pays)", partner: "Partner (partner handles it)" } as const;

/** The list of cases: reason, codes, status, time left in the 5-day window, amount */
export function CaseList({ cases, onOpen }: { cases: CaseWithResponse[]; onOpen: (id: string) => void }) {
  return (
    <ul className="divide-y divide-line rounded-field border border-line bg-white">
      {cases.map((d) => {
        const left = timeLeft(d.windowEndsAt);
        return (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onOpen(d.id)}
              className="flex w-full flex-col gap-1.5 px-5 py-4 text-left hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="min-w-0">
                <span className="block text-ui font-semibold text-ink-900">{d.reason}</span>
                <span className="code-text block text-meta text-ink-500">
                  {d.id}, {d.trackingId}
                </span>
              </span>
              <span className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-meta">
                <span className={cn("font-medium", d.status === "awaiting_partner" && !d.response ? "text-blue-700" : "text-ink-700")}>
                  {d.response && d.status !== "resolved" ? "Response sent" : CASE_STATUS[d.status]}
                </span>
                {d.status !== "resolved" && <span className={cn("tabular-nums", left.urgent ? "text-alert-700" : "text-ink-700")}>{left.text}</span>}
                <span className="text-ink-900 tabular-nums">{formatNaira(d.amount)}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * One case: the window, the evidence (buyer and seller chat as bubbles,
 * photos, delivery code) and the responder's side, sent through onRespond.
 */
export function CaseDetail({
  dispute: d,
  onRespond,
  prompt = "What happened at delivery?",
  help = "Stick to what you saw: the parcel's condition, who received it, and the time.",
  canRespond = true,
}: {
  dispute: CaseWithResponse;
  onRespond: (text: string) => Promise<unknown>;
  prompt?: string;
  help?: string;
  canRespond?: boolean;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const left = timeLeft(d.windowEndsAt);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onRespond(text);
      setText("");
    } catch (err) {
      setError(err instanceof PortalError ? (err.fields?.text ?? err.message) : "That didn't send. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Facts
        rows={[
          ["Status", CASE_STATUS[d.status]],
          ...(d.status === "resolved"
            ? ([
                ["Decision", d.decision ? DECISION_LABEL[d.decision] : "Decided"],
                ...(d.faultAssigned ? ([["Fault", FAULT_LABEL[d.faultAssigned]]] as Array<[string, string]>) : []),
              ] as Array<[string, string]>)
            : ([["Window", `${left.text}, ends ${formatDayTime(d.windowEndsAt)}`]] as Array<[string, string]>)),
          ["Order value", formatNaira(d.amount)],
          ["Depot order", d.orderId],
        ]}
      />

      <section aria-labelledby="evidence-title" className="flex flex-col gap-3">
        <h3 id="evidence-title" className="text-section-title text-ink-900">
          Evidence
        </h3>
        <div className="flex flex-col gap-2 rounded-convo bg-blue-50 p-4">
          {d.evidence.chat.map((m, i) =>
            m.from === "system" ? (
              <Bubble key={i} variant="system" sender={{ name: m.name, system: "sunpay" }} time={formatTime(m.at)}>
                {m.text}
              </Bubble>
            ) : (
              <Bubble key={i} variant="in" sender={{ name: `${m.name} (${m.from})` }} showName time={formatTime(m.at)} onTint>
                {m.text}
              </Bubble>
            ),
          )}
        </div>
        <ul className="flex flex-col gap-1 text-ui text-ink-700">
          <li className="flex items-center gap-2">
            <ImageIcon aria-hidden="true" className="size-4 text-ink-500" strokeWidth={1.8} />
            {d.evidence.photos === 0 ? "No photos" : `${d.evidence.photos} photo${d.evidence.photos === 1 ? "" : "s"} from the buyer and seller`}
          </li>
          {d.evidence.deliveryCodeVerified && (
            <li className="flex items-center gap-2 text-ok-700">
              <CircleCheck aria-hidden="true" className="size-4" strokeWidth={1.8} />
              Delivery code verified at handover
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="response-title" className="flex flex-col gap-3">
        <h3 id="response-title" className="text-section-title text-ink-900">
          Your side
        </h3>
        {d.response ? (
          <div className="rounded-field border border-line px-4 py-3">
            <p className="text-ui text-ink-900">{d.response.text}</p>
            <p className="mt-1 text-meta text-ink-500">
              Sent {formatDayTime(d.response.at)}
              {d.response.by ? ` by ${d.response.by}` : ""}. Buzz reviews it with the chat and the scan log.
            </p>
          </div>
        ) : d.status === "resolved" ? (
          <p className="text-ui text-ink-500">This case is decided, so no response is needed.</p>
        ) : !canRespond ? (
          <p className="text-ui text-ink-500">Your role can read this case but not answer it.</p>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-3">
            <label htmlFor="case-response" className="text-[14px] font-semibold text-ink-900">
              {prompt}
            </label>
            <textarea
              id="case-response"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={1000}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "case-error" : "case-help"}
              className={cn(
                "w-full rounded-field border-[1.5px] bg-white px-4 py-3 text-[16px] text-ink-900 hover:border-ink-500 focus:outline-3 focus:outline-offset-3 focus:outline-sky-400",
                error ? "border-alert-600" : "border-line-strong",
              )}
            />
            {error ? (
              <p id="case-error" className="flex items-start gap-1.5 text-[14px] text-alert-700">
                <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
                {error}
              </p>
            ) : (
              <p id="case-help" className="text-[13px] text-ink-500">
                {help}
              </p>
            )}
            <Button type="submit" loading={busy} className="self-start">
              Send your side
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
