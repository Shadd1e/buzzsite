import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1: one clear sentence about what this is, plus the action to
 * start. "No riders yet. Add your first rider to give them a rider code."
 * No illustration by default: product surfaces stay calm.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  tone = "product",
  className,
}: {
  icon?: ReactNode;
  /** The one clear sentence */
  title: string;
  /** Optional second sentence: what to do next */
  body?: ReactNode;
  action?: ReactNode;
  tone?: "product" | "brand";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        tone === "product" ? "gap-3 rounded-field border border-dashed border-line-strong px-6 py-12" : "gap-4 py-16",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-tile bg-blue-50 text-blue-600 [&_svg]:size-6"
        >
          {icon}
        </span>
      )}
      <div className="max-w-[34em]">
        <p className={cn("text-ink-900", tone === "product" ? "text-section-title" : "text-h3")}>{title}</p>
        {body && (
          <p className={cn("mt-1.5 text-ink-500", tone === "product" ? "text-ui" : "text-body")}>{body}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
