import { Package } from "lucide-react";
import type { ParcelStatus } from "@/lib/data/types";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "./Button";
import { StatusPill } from "./StatusPill";

/**
 * Order card inside a chat (DESIGN.md §11: product thumbnail, status pill,
 * tracking ID, "Track" button). Works on light and Buzz Web dark.
 */
export function OrderCard({
  item,
  status,
  trackingId,
  thumbnail,
  href,
  onTrack,
  theme = "light",
  className,
}: {
  item: string;
  status: ParcelStatus;
  trackingId: string;
  /** Product photo URL; a neutral tile is shown until there is one */
  thumbnail?: string;
  /** Where "Track" goes. Pass onTrack instead inside an app (Buzz Web panel). */
  href?: string;
  onTrack?: () => void;
  theme?: "light" | "dark";
  className?: string;
}) {
  const dark = theme === "dark";
  return (
    <article
      aria-label={`Order: ${item}`}
      className={cn(
        "flex w-full max-w-[340px] flex-col gap-3 rounded-card border p-3",
        dark ? "border-dark-raised bg-dark-surface" : "border-line bg-white",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-14 shrink-0 place-items-center overflow-hidden rounded-tile",
            dark ? "bg-dark-raised text-dark-meta" : "bg-mist text-ink-500",
          )}
        >
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element -- product photos come from sellers, size unknown
            <img src={thumbnail} alt="" className="size-full object-cover" />
          ) : (
            <Package aria-hidden="true" className="size-6" strokeWidth={1.6} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-[15px] font-semibold", dark ? "text-dark-text" : "text-ink-900")}>{item}</p>
          <p className={cn("code-text mt-0.5 text-[13px]", dark ? "text-dark-meta" : "text-ink-500")}>
            <span className="sr-only">Tracking ID </span>
            {trackingId}
          </p>
          <StatusPill status={status} size="sm" theme={theme} className="mt-1.5" />
        </div>
      </div>
      {onTrack ? (
        <Button onClick={onTrack} variant={dark ? "light" : "outline"} size="sm" className="w-full">
          Track
        </Button>
      ) : (
        <ButtonLink href={href ?? "#"} variant={dark ? "light" : "outline"} size="sm" className="w-full">
          Track
        </ButtonLink>
      )}
    </article>
  );
}
