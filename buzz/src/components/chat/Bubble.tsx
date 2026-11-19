import type { ReactNode } from "react";
import { Check, CheckCheck, TriangleAlert } from "lucide-react";
import type { MessageStatus } from "@/lib/data/types";
import { cn } from "@/lib/cn";
import { Avatar, type Sender } from "./Avatar";

/**
 * DESIGN.md §5.1, the signature.
 * - Radius 20px with the tail corner at 6px. Padding 11px 15px 9px. Max 82%.
 * - in:     white (or glass over images), tail bottom-left, avatar always shown
 * - out:    --blue-600, white text, tail bottom-right, read ticks in --tick
 * - system: white with a 1.5px --blue-600 border (SunPay escrow notices)
 * - alert:  2px --alert-600 border plus warning icon (EMBA)
 * - theme="dark": Buzz Web dark theme (§2.2). Outgoing stays --blue-600.
 */
export type BubbleVariant = "in" | "out" | "system" | "alert";
export type ChatTheme = "light" | "dark";

export interface BubbleProps {
  variant: BubbleVariant;
  /** Who sent it. Required for in, system and alert. */
  sender?: Sender;
  /** Show the sender's name above the text (groups, system, alert) */
  showName?: boolean;
  time?: string;
  /** Outgoing only */
  status?: MessageStatus;
  /** Incoming over a photo: liquid glass instead of white */
  glass?: boolean;
  /** On a tinted panel, incoming bubbles get the hairline shadow (§4) */
  onTint?: boolean;
  theme?: ChatTheme;
  children: ReactNode;
  className?: string;
}

const statusText: Record<MessageStatus, string> = { sent: "Sent", delivered: "Delivered", read: "Read" };

/**
 * Message receipts. They differ by shape and lightness, not only hue (§2.2):
 * sent = one tick, delivered = two ticks, read = two ticks on a filled
 * --tick badge. All white on --blue-600 pass contrast.
 */
export function Ticks({ status }: { status: MessageStatus }) {
  return (
    <>
      {status === "sent" && <Check aria-hidden="true" className="size-4 text-white" strokeWidth={2} />}
      {status === "delivered" && <CheckCheck aria-hidden="true" className="size-4 text-white" strokeWidth={2} />}
      {status === "read" && (
        <span aria-hidden="true" className="grid h-4 w-5 place-items-center rounded-full bg-tick text-blue-700">
          <CheckCheck className="size-3.5" strokeWidth={2.5} />
        </span>
      )}
      <span className="sr-only">{statusText[status]}</span>
    </>
  );
}

export function Bubble({
  variant,
  sender,
  showName,
  time,
  status,
  glass,
  onTint,
  theme = "light",
  children,
  className,
}: BubbleProps) {
  const isOut = variant === "out";
  const dark = theme === "dark";
  const nameShown = showName ?? (variant === "system" || variant === "alert");

  const surface = dark
    ? {
        in: "bg-dark-bubble-in text-dark-text",
        out: "bg-blue-600 text-white",
        system: "bg-dark-surface text-dark-text border-[1.5px] border-blue-600",
        alert: "bg-dark-surface text-dark-text border-2 border-alert-600",
      }[variant]
    : {
        in: cn(glass ? "glass" : "bg-white", onTint && !glass && "shadow-hair", "text-ink-900"),
        out: "bg-blue-600 text-white",
        system: "bg-white text-ink-900 border-[1.5px] border-blue-600",
        alert: "bg-white text-ink-900 border-2 border-alert-600",
      }[variant];

  // Meta text: white on blue (4.6:1), ink-500 on white, dark-meta on dark.
  const metaClass = isOut ? "text-white" : dark ? "text-dark-meta" : "text-ink-500";
  const nameClass =
    variant === "alert"
      ? dark
        ? "text-alert-50"
        : "text-alert-700"
      : dark
        ? "text-sky-400"
        : "text-blue-600";

  return (
    <div className={cn("flex w-full items-end gap-2", isOut ? "justify-end" : "justify-start", className)}>
      {!isOut && sender && <Avatar sender={sender} size="md" decorative />}
      <div
        className={cn(
          "max-w-[82%] min-w-0 rounded-card px-[15px] pt-[11px] pb-[9px]",
          isOut ? "rounded-br-tag" : "rounded-bl-tag",
          surface,
        )}
      >
        {/* Screen readers get the sender even when the name isn't shown */}
        {!isOut && sender && !nameShown && <span className="sr-only">{sender.name}: </span>}
        {isOut && <span className="sr-only">You: </span>}
        {nameShown && sender && (
          <p className={cn("mb-0.5 flex items-center gap-1 text-[12px] leading-4 font-semibold", nameClass)}>
            {variant === "alert" && <TriangleAlert aria-hidden="true" className="size-3.5" strokeWidth={2} />}
            {sender.name}
          </p>
        )}
        <div className="text-bubble break-words">{children}</div>
        {(time || (isOut && status)) && (
          <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-[12px] leading-4 tabular-nums", metaClass)}>
            {time && <time>{time}</time>}
            {isOut && status && <Ticks status={status} />}
          </p>
        )}
      </div>
    </div>
  );
}
