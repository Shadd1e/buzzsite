import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1 + PRODUCT.md truth rule 8: product surfaces built on mock
 * data show a "Test data" ribbon, top-right, --warn-50 / --warn-700.
 *
 * placement:
 * - "docked" (preferred in app shells): sits in the top bar's right-hand
 *   group, before the bell and account, so it never covers a control.
 * - "fixed": floats top-right for pages with no top bar. z-45 keeps it above
 *   the sticky nav but under sheets, dialogs and toasts.
 */
export function TestDataRibbon({
  placement = "fixed",
  className,
}: {
  placement?: "fixed" | "docked";
  className?: string;
}) {
  return (
    <p
      role="note"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warn-700/20 bg-warn-50 font-semibold whitespace-nowrap text-warn-700",
        placement === "fixed"
          ? "pointer-events-none fixed top-3 right-3 z-45 px-2.5 py-1 text-[12px] shadow-float md:top-4 md:right-4 md:px-3 md:py-1.5 md:text-[13px]"
          : "px-2.5 py-1 text-[12px]",
        className,
      )}
    >
      <FlaskConical aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
      Test data
    </p>
  );
}
