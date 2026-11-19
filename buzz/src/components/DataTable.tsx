"use client";

import type { ReactNode } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";

/**
 * DESIGN.md §10.4 product tables.
 * - 48px rows, sticky header, tabular nums, row hover --blue-50
 * - selected row: --blue-600 2px left inset (the only allowed left accent,
 *   and only on a selected row)
 * - states: ready, loading (skeleton rows), error, empty, no-results
 * - below 768px rows stack: primary columns on line 1, secondary on line 2
 */
export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Where the column goes on phones. Default "secondary". */
  mobile?: "primary" | "secondary" | "hidden";
  className?: string;
}

export type TableState = "ready" | "loading" | "error" | "empty" | "no-results";

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  rowLabel,
  selectedId,
  onSelect,
  state = "ready",
  caption,
  empty,
  noResults,
  errorMessage = "The list didn't load. Check your connection, then try again.",
  onRetry,
  maxHeight,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Accessible name for a row's open button, e.g. "Open parcel BZT-…" */
  rowLabel?: (row: T) => string;
  selectedId?: string | null;
  onSelect?: (row: T) => void;
  state?: TableState;
  /** Describes the table for screen readers */
  caption: string;
  empty?: ReactNode;
  noResults?: ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
  /** Scroll inside the table with a sticky header, e.g. "420px" */
  maxHeight?: string;
  className?: string;
}) {
  if (state === "empty") return <>{empty}</>;
  if (state === "no-results") return <>{noResults}</>;
  if (state === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-field border border-line px-6 py-12 text-center">
        <CircleAlert aria-hidden="true" className="size-6 text-alert-700" strokeWidth={1.8} />
        <p className="max-w-[34em] text-ui text-ink-900">{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} icon={<RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  const loading = state === "loading";
  const primary = columns.filter((c) => c.mobile === "primary");
  const secondary = columns.filter((c) => (c.mobile ?? "secondary") === "secondary");

  return (
    <div className={cn("rounded-field border border-line bg-white", className)} aria-busy={loading || undefined}>
      {/* Desktop and tablet */}
      <div className="hidden overflow-auto rounded-field md:block" style={maxHeight ? { maxHeight } : undefined}>
        <table className="w-full border-separate border-spacing-0 text-left">
          <caption className="sr-only">
            {caption}
            {loading && ", loading"}
          </caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "sticky top-0 z-10 h-11 border-b border-line bg-white px-4 text-label whitespace-nowrap text-ink-500",
                    c.align === "right" && "text-right",
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    {columns.map((c, j) => (
                      <td key={c.key} className="h-12 border-b border-line px-4 last-of-type:border-b-0">
                        <Skeleton className={cn(j === 0 ? "w-32" : "w-20", c.align === "right" && "ml-auto")} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => {
                  const id = getRowId(row);
                  const selected = selectedId === id;
                  return (
                    <tr
                      key={id}
                      className={cn(
                        "group relative transition-colors duration-(--dur-1) ease-out",
                        onSelect && "cursor-pointer hover:bg-blue-50",
                        selected && "bg-blue-50",
                      )}
                    >
                      {columns.map((c, j) => (
                        <td
                          key={c.key}
                          className={cn(
                            "h-12 border-b border-line px-4 text-ui whitespace-nowrap text-ink-900 tabular-nums group-last:border-b-0",
                            c.align === "right" && "text-right",
                            j === 0 && selected && "shadow-[inset_2px_0_0_var(--color-blue-600)]",
                            c.className,
                          )}
                        >
                          {j === 0 && onSelect ? (
                            <button
                              type="button"
                              onClick={() => onSelect(row)}
                              aria-label={rowLabel?.(row)}
                              aria-current={selected || undefined}
                              // Stretched over the whole row so the row is the target
                              className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:-outline-offset-3 focus-visible:after:outline-sky-400"
                            >
                              {c.cell(row)}
                            </button>
                          ) : (
                            c.cell(row)
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Phones: stacked rows */}
      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="flex flex-col gap-2.5 px-4 py-3.5">
                <Skeleton className="w-40" />
                <Skeleton className="w-56" />
              </li>
            ))
          : rows.map((row) => {
              const id = getRowId(row);
              const selected = selectedId === id;
              const body = (
                <>
                  <span className="flex flex-wrap items-center justify-between gap-2 text-ui text-ink-900 tabular-nums">
                    {primary.map((c) => (
                      <span key={c.key}>{c.cell(row)}</span>
                    ))}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-meta text-ink-500 tabular-nums">
                    {secondary.map((c) => (
                      <span key={c.key}>{c.cell(row)}</span>
                    ))}
                  </span>
                </>
              );
              return (
                <li key={id} className={cn(selected && "bg-blue-50 shadow-[inset_2px_0_0_var(--color-blue-600)]")}>
                  {onSelect ? (
                    <button
                      type="button"
                      onClick={() => onSelect(row)}
                      aria-label={rowLabel?.(row)}
                      aria-current={selected || undefined}
                      className="flex w-full flex-col px-4 py-3 text-left hover:bg-blue-50"
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="flex flex-col px-4 py-3">{body}</div>
                  )}
                </li>
              );
            })}
      </ul>
    </div>
  );
}
