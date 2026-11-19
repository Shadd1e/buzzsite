"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Detail drawer (DESIGN.md §10.2: row → detail drawer). Slides in from the
 * right on tablet and up, and up from the bottom on phones. Drawers are one
 * of the few things that float, so they get --shadow-float (§4, §10.2).
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Actions pinned to the bottom, e.g. Reprint label / Assign rider */
  footer?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/40 data-[state=open]:animate-overlay-in" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col bg-white shadow-float outline-none",
            // phones: bottom sheet
            "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-convo data-[state=open]:animate-drawer-up",
            // tablet and up: right panel
            "md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[460px] md:rounded-t-none md:rounded-l-panel md:data-[state=open]:animate-drawer-right",
          )}
        >
          <div className="flex items-start gap-3 border-b border-line px-5 pt-5 pb-4 md:px-6">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-section-title text-ink-900">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-0.5 text-meta text-ink-500">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title} details</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="-mt-1.5 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-mist hover:text-ink-900"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>
          {footer && (
            <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))] md:px-6">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
