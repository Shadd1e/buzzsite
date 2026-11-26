"use client";

import { useId, useState, type ReactNode, type RefObject } from "react";
import { ChevronDown, CircleAlert, FlaskConical } from "lucide-react";
import type { logisticsLogin } from "@/content/logistics";
import { cn } from "@/lib/cn";

export type SignInCopy = typeof logisticsLogin;

export const textLink =
  "inline-flex min-h-11 items-center text-[15px] font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700";

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

/** Form-level problem: what happened and what to do, plus an optional fix button. */
export function FormAlert({
  alertRef,
  children,
  action,
}: {
  alertRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div
      ref={alertRef}
      tabIndex={-1}
      role="alert"
      className="flex items-start gap-2 rounded-field border border-alert-600/25 bg-alert-50 px-4 py-3 text-[14px] leading-snug text-alert-700 outline-none"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
      <div className="min-w-0">
        <p>{children}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-1 inline-flex min-h-11 items-center font-semibold text-alert-700 underline decoration-alert-700/30 underline-offset-4 hover:decoration-alert-700"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

/** Test-build note, styled like the Test data ribbon. */
export function TestNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 text-[14px] leading-snug text-warn-700", className)}>
      <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
      <span>{children}</span>
    </p>
  );
}

/**
 * Test build only: who to sign in as. A one-line disclosure in warn ink, not
 * a filled panel, so it never outweighs the form. Opened, it lists accounts
 * on white with the shared test password and 2FA code on top.
 */
export function TestAccountList({
  copy,
  rows,
  actionLabel,
}: {
  copy: SignInCopy;
  rows: Array<{ key: string; title: string; detail: string[]; onUse: () => void; useLabel: string }>;
  /** The row button's verb. Defaults to "Use" (fills the form). */
  actionLabel?: string;
}) {
  return (
    <details className="group text-warn-700">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full text-[14px] font-semibold [&::-webkit-details-marker]:hidden">
        <FlaskConical aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.8} />
        <span className="underline decoration-warn-700/30 underline-offset-4 group-hover:decoration-warn-700">{copy.accounts.title}</span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform duration-(--dur-1) ease-out group-open:rotate-180" strokeWidth={1.8} />
      </summary>
      <div className="mt-2 overflow-hidden rounded-field border border-line bg-white">
        <p className="border-b border-line bg-warn-50 px-4 py-3 text-[13px] leading-snug">{copy.test}</p>
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-3 py-2 pr-2 pl-4 text-[14px]">
              <span className="min-w-0">
                <span className="block font-semibold text-ink-900">{r.title}</span>
                {r.detail.map((d) => (
                  <span key={d} className="block text-[13px] break-words text-ink-500">
                    {d}
                  </span>
                ))}
              </span>
              <button
                type="button"
                onClick={r.onUse}
                className="inline-flex min-h-11 shrink-0 items-center rounded-full px-4 font-semibold text-blue-700 hover:bg-blue-50"
              >
                {actionLabel ?? copy.accounts.use}
                <span className="sr-only"> {r.useLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/** "Forgot your password?" opens a short answer in place instead of leaving the page. */
export function ForgotPassword({
  label,
  body,
  actions,
}: {
  label: string;
  body: string;
  actions: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={textLink}>
        {label}
      </button>
      {open && (
        <div id={id} className="flex w-full basis-full flex-col items-start gap-1 border-l-2 border-blue-600 py-1 pl-4">
          <p className="text-[15px] leading-snug text-ink-700">{body}</p>
          <div className="flex flex-wrap gap-x-6">{actions}</div>
        </div>
      )}
    </>
  );
}

