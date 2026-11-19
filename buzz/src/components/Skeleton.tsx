import { cn } from "@/lib/cn";

/**
 * Loading placeholder (DESIGN.md §10.4: every list has a loading state of
 * skeleton rows). A slow opacity pulse; still under reduced motion.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block h-3.5 rounded-full bg-mist motion-safe:animate-skeleton", className)}
    />
  );
}
