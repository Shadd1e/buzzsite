"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Toast as RadixToast } from "radix-ui";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1: bottom-centre on mobile, bottom-right on desktop, glass,
 * reusing the action verb ("Add rider" → "Rider added").
 */
export type ToastTone = "success" | "info" | "error";

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Optional follow-up, e.g. { label: "Undo", onClick } */
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  open: boolean;
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return show;
}

const toneIcon = {
  success: <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-ok-700" strokeWidth={1.8} />,
  info: <Info aria-hidden="true" className="size-5 shrink-0 text-blue-600" strokeWidth={1.8} />,
  error: <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-alert-700" strokeWidth={1.8} />,
} satisfies Record<ToastTone, ReactNode>;

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((options: ToastOptions) => {
    setItems((prev) => [...prev.slice(-2), { ...options, id: nextId++, open: true }]);
  }, []);

  const setOpen = (id: number, open: boolean) => {
    if (open) return;
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)));
    // Remove after the exit animation has run.
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 400);
  };

  return (
    <ToastContext.Provider value={show}>
      <RadixToast.Provider swipeDirection="down" duration={5000} label="Notification">
        {children}
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onOpenChange={(open) => setOpen(t.id, open)} />
        ))}
        <RadixToast.Viewport
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 m-0 flex list-none flex-col items-center gap-2 p-4 outline-none",
            "md:inset-x-auto md:right-0 md:w-[468px] md:items-end md:p-6",
          )}
        />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

/** Static rendering of a toast for documentation (/dev/components). */
export function ToastPreview({
  title,
  description,
  tone = "success",
  actionLabel,
}: Pick<ToastOptions, "title" | "description" | "tone"> & { actionLabel?: string }) {
  return (
    <div
      className={cn(
        "glass flex w-full max-w-[420px] gap-3 rounded-field border border-white/60 py-2.5 pr-2 pl-4 shadow-float",
        description ? "items-start" : "items-center",
      )}
    >
      <span className={description ? "pt-2" : undefined}>{toneIcon[tone]}</span>
      <div className="min-w-0 flex-1 py-1.5">
        <p className="text-[15px] font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-0.5 text-[14px] leading-snug text-ink-700">{description}</p>}
      </div>
      {actionLabel && (
        <span className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-[14px] font-semibold text-blue-600">
          {actionLabel}
        </span>
      )}
      <span className="grid size-11 shrink-0 place-items-center text-ink-500" aria-hidden="true">
        <X className="size-[18px]" strokeWidth={1.8} />
      </span>
    </div>
  );
}

function ToastCard({
  item,
  onOpenChange,
}: {
  item: Omit<ToastItem, "id">;
  onOpenChange?: (open: boolean) => void;
}) {
  const tone = item.tone ?? "success";
  return (
    <RadixToast.Root
      open={item.open}
      onOpenChange={onOpenChange}
      duration={item.duration}
      type={tone === "error" ? "foreground" : "background"}
      className={cn(
        "glass flex w-full max-w-[420px] gap-3 rounded-field border border-white/60 py-2.5 pr-2 pl-4 shadow-float",
        item.description ? "items-start" : "items-center",
        "data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out",
        "data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y) data-[swipe=cancel]:translate-y-0",
        "data-[swipe=end]:animate-toast-out",
      )}
    >
      <span className={item.description ? "pt-2" : undefined}>{toneIcon[tone]}</span>
      <div className="min-w-0 flex-1 py-1.5">
        <RadixToast.Title className="text-[15px] font-semibold text-ink-900">{item.title}</RadixToast.Title>
        {item.description && (
          <RadixToast.Description className="mt-0.5 text-[14px] leading-snug text-ink-700">
            {item.description}
          </RadixToast.Description>
        )}
      </div>
      {item.action && (
        <RadixToast.Action
          altText={item.action.label}
          onClick={item.action.onClick}
          className="min-h-11 shrink-0 rounded-full px-3 text-[14px] font-semibold text-blue-600 hover:bg-blue-50"
        >
          {item.action.label}
        </RadixToast.Action>
      )}
      <RadixToast.Close
        aria-label="Dismiss"
        className="grid size-11 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-mist hover:text-ink-900"
      >
        <X aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
      </RadixToast.Close>
    </RadixToast.Root>
  );
}
