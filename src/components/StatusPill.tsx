import {
  Ban,
  CircleCheck,
  Clock,
  PackageCheck,
  PackagePlus,
  RotateCcw,
  ShieldAlert,
  Store,
  TriangleAlert,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { ParcelStatus } from "@/lib/data/types";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1 status pills. Signals also differ by icon and lightness, not
 * only hue (§2.2). "In transit" gets the animated dot instead of an icon.
 * `refused` and `storage_expiring` exist in the test data but not in §8.1;
 * they follow the nearest rule (refused → returned to seller, ink; storage
 * ending → a pending state, warn).
 */
type Tone = "ink" | "blue" | "sky" | "warn" | "ok" | "alert";

const statusMap: Record<ParcelStatus, { label: string; tone: Tone; icon: LucideIcon | "dot" }> = {
  booked: { label: "Booked", tone: "ink", icon: PackagePlus },
  picked_up: { label: "Picked up", tone: "blue", icon: PackageCheck },
  in_transit: { label: "In transit", tone: "blue", icon: "dot" },
  at_pickup_point: { label: "At pickup point", tone: "warn", icon: Store },
  out_for_delivery: { label: "Out for delivery", tone: "sky", icon: Truck },
  delivered: { label: "Delivered", tone: "ok", icon: CircleCheck },
  failed_attempt: { label: "Failed attempt", tone: "warn", icon: TriangleAlert },
  returned: { label: "Returned", tone: "ink", icon: RotateCcw },
  disputed: { label: "Disputed", tone: "alert", icon: ShieldAlert },
  refused: { label: "Refused", tone: "ink", icon: Ban },
  storage_expiring: { label: "Storage ending", tone: "warn", icon: Clock },
};

const toneClass: Record<Tone, string> = {
  ink: "bg-mist text-ink-900 border-line",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  sky: "bg-sky-400/15 text-ink-900 border-sky-400/40",
  warn: "bg-warn-50 text-warn-700 border-warn-700/15",
  ok: "bg-ok-50 text-ok-700 border-ok-600/25",
  alert: "bg-alert-50 text-alert-700 border-alert-600/25",
};

// Buzz Web dark theme: tinted fills on dark surfaces, light text (all ≥4.5:1)
const darkToneClass: Record<Tone, string> = {
  ink: "bg-dark-raised text-dark-text border-dark-raised",
  blue: "bg-blue-600/25 text-dark-text border-blue-600/40",
  sky: "bg-sky-400/20 text-dark-text border-sky-400/40",
  warn: "bg-warn-50/15 text-warn-50 border-warn-50/25",
  ok: "bg-ok-600/20 text-ok-50 border-ok-600/40",
  alert: "bg-alert-600/25 text-alert-50 border-alert-600/45",
};

export function statusLabel(status: ParcelStatus): string {
  return statusMap[status].label;
}

export function StatusPill({
  status,
  size = "md",
  theme = "light",
  className,
}: {
  status: ParcelStatus;
  size?: "sm" | "md";
  theme?: "light" | "dark";
  className?: string;
}) {
  const { label, tone, icon: Icon } = statusMap[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "h-6 px-2.5 text-[12px]" : "h-7 px-3 text-[13px]",
        theme === "dark" ? darkToneClass[tone] : toneClass[tone],
        className,
      )}
    >
      {Icon === "dot" ? (
        <span aria-hidden="true" className="grid size-3.5 place-items-center">
          <span className={cn("size-2 rounded-full motion-safe:animate-live-dot", theme === "dark" ? "bg-sky-400" : "bg-blue-600")} />
        </span>
      ) : (
        <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.8} />
      )}
      {label}
    </span>
  );
}
