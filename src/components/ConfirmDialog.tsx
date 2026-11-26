"use client";

import { useState, type ReactNode } from "react";
import { AlertDialog } from "radix-ui";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

/**
 * Confirmation for destructive or money actions (DESIGN.md §10.2, §10.3:
 * "Deactivate rider (danger, with a confirm dialog; history is kept)").
 * The confirm button repeats the action's verb; the toast that follows
 * reuses it ("Rider deactivated").
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A question naming the action: "Deactivate Tunde Bakare?" */
  title: string;
  /** What happens, and what is kept: "They can't sign in. Their history is kept." */
  description: ReactNode;
  /** The action's verb: "Deactivate rider" */
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  /** May return a promise; the button shows loading until it settles. Throw to keep the dialog open. */
  onConfirm: () => void | Promise<void>;
  /** Extra fields, e.g. a reason select */
  children?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // The action failed (e.g. a required reason is missing). Stay open so
      // the person can fix it; the caller shows the error.
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-navy/40 data-[state=open]:animate-overlay-in" />
        <AlertDialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2",
            "rounded-panel bg-white p-6 shadow-float outline-none data-[state=open]:animate-dialog-in",
          )}
        >
          <AlertDialog.Title className="text-section-title text-ink-900">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-ui text-ink-700">{description}</AlertDialog.Description>
          {children && <div className="mt-5">{children}</div>}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" disabled={busy}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            {/* Not AlertDialog.Action: it would close before onConfirm settles */}
            <Button variant={tone === "danger" ? "danger" : "solid"} loading={busy} onClick={confirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
