import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1: 40px pills for filters and categories. The selected chip is
 * --ink-900 with white text. It's a toggle, so it carries aria-pressed.
 * A 40px chip is under the 44px target, so a transparent ::after extends the
 * hit area by 2px top and bottom.
 */
export function Chip({
  selected = false,
  icon,
  count,
  className,
  children,
  ...rest
}: {
  selected?: boolean;
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "children">) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium whitespace-nowrap",
        "after:absolute after:-inset-y-0.5 after:inset-x-0 after:content-['']",
        "transition-[background-color,border-color,color] duration-(--dur-2) ease-out",
        "disabled:pointer-events-none disabled:opacity-45",
        selected
          ? "bg-ink-900 text-white"
          : "border border-line-strong bg-white text-ink-900 hover:border-ink-900",
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "tabular-nums text-[13px]",
            selected ? "text-white/85" : "text-ink-500",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
