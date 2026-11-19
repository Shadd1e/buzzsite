import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1: 280×572, 46px outer radius, navy bezel, 37px screen radius.
 * It shows real Buzz UI built in HTML. No fake status bar, so the screen
 * starts with whatever app UI you pass in.
 */
export function PhoneFrame({
  children,
  label,
  screenClassName,
  className,
}: {
  children: ReactNode;
  /** Describes what the screen shows, for screen readers */
  label: string;
  screenClassName?: string;
  className?: string;
}) {
  return (
    <figure
      aria-label={label}
      className={cn(
        "relative h-[572px] w-[280px] shrink-0 rounded-phone bg-navy p-[9px] shadow-float",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden rounded-screen bg-white",
          screenClassName,
        )}
      >
        {children}
      </div>
    </figure>
  );
}
