import Link from "next/link";
import { ShieldAlert, Truck, WifiOff, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Banners (DESIGN.md §11).
 * - delivery: priority delivery update, glass, opens the tracking panel
 * - security: a security update, in the alert colour
 * - offline:  "Your phone is offline. Messages will send when it reconnects."
 */
export type BannerTone = "delivery" | "security" | "offline";

const tones: Record<BannerTone, { icon: LucideIcon; wrap: string; tile: string; role: "status" | "alert" }> = {
  delivery: { icon: Truck, wrap: "glass border-white/60 shadow-float", tile: "bg-blue-600 text-white", role: "status" },
  security: { icon: ShieldAlert, wrap: "bg-white border-2 border-alert-600 shadow-float", tile: "bg-alert-600 text-white", role: "alert" },
  offline: { icon: WifiOff, wrap: "bg-warn-50 border-warn-700/20", tile: "bg-white text-warn-700", role: "status" },
};

const actionClass =
  "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-[14px] font-semibold text-blue-600 hover:bg-blue-50";

export function NotificationBanner({
  tone,
  title,
  body,
  action,
  onDismiss,
  className,
}: {
  tone: BannerTone;
  title: string;
  body?: string;
  /** A link (href) or, inside an app shell like Buzz Web, a button (onClick) */
  action?: { label: string; href?: string; onClick?: () => void };
  /** Shows a close button */
  onDismiss?: () => void;
  className?: string;
}) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <div role={t.role} className={cn("flex w-full max-w-[460px] items-center gap-3 rounded-field border p-3", t.wrap, className)}>
      <span aria-hidden="true" className={cn("grid size-10 shrink-0 place-items-center rounded-tile", t.tile)}>
        <Icon className="size-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-semibold", tone === "offline" ? "text-warn-700" : "text-ink-900")}>{title}</p>
        {body && <p className={cn("text-[13px] leading-snug", tone === "offline" ? "text-warn-700" : "text-ink-700")}>{body}</p>}
      </div>
      {action?.href && (
        <Link href={action.href} className={actionClass}>
          {action.label}
        </Link>
      )}
      {action?.onClick && !action.href && (
        <button type="button" onClick={action.onClick} className={actionClass}>
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 grid size-11 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
        >
          <X aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}
