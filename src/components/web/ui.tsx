import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Small Buzz Web primitives that work in both themes (web-* tokens).
 * Product register: quiet until hovered, 44px targets.
 */

export const iconButton =
  "relative grid size-11 shrink-0 place-items-center rounded-full text-web-meta " +
  "transition-colors duration-(--dur-1) ease-out hover:bg-web-hover hover:text-web-text " +
  "aria-pressed:bg-web-selected aria-pressed:text-web-text data-[state=open]:bg-web-hover data-[state=open]:text-web-text";

export function IconButton({
  label,
  children,
  className,
  ...rest
}: { label: string; children: ReactNode } & Omit<ComponentPropsWithoutRef<"button">, "children">) {
  return (
    <button type="button" aria-label={label} title={label} className={cn(iconButton, className)} {...rest}>
      {children}
    </button>
  );
}

/** "Pro" tag next to business names (Pro ID accounts) */
export function ProTag() {
  return (
    <span className="inline-flex h-5 shrink-0 items-center rounded-tag bg-blue-600 px-1.5 text-[11px] leading-none font-semibold text-white">
      Pro
    </span>
  );
}

/** Unread count: white on --blue-600 */
export function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span className="inline-grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-blue-600 px-1.5 text-[12px] leading-none font-semibold text-white tabular-nums">
      {count > 99 ? "99+" : count}
      <span className="sr-only"> {label}</span>
    </span>
  );
}

/** Menu surface for Radix dropdowns and popovers */
export const menuSurface =
  "z-50 min-w-[220px] rounded-field border border-web-line bg-web-surface p-1.5 text-web-text shadow-float " +
  "data-[state=open]:animate-[overlay-in_var(--dur-2)_var(--ease-out)]";

export const menuItem =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-tile px-3 text-[14px] outline-none select-none " +
  "data-highlighted:bg-web-hover data-disabled:cursor-default data-disabled:opacity-45";
