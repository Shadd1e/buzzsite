import Image from "next/image";
import { ShieldAlert, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §5.1: real photos when available, otherwise initials on a colour
 * picked from the person's name. System senders (SunPay, Buzz, EMBA) use their
 * own marks (placeholders until the official marks arrive).
 *
 * Palette (DESIGN.md §5.1): amber, sky, pink, teal, indigo, burnt orange.
 * No red or green, which mean safety and success. --ink-900 initials pass
 * 4.5:1 on all six (indigo is the tightest at 4.52:1).
 */
export type SystemSender = "sunpay" | "buzz" | "emba";

export interface Sender {
  name: string;
  /** Photo URL. Never a stock photo presented as a real customer. */
  src?: string;
  system?: SystemSender;
}

const palette = [
  "bg-avatar-1", // amber
  "bg-avatar-2", // sky
  "bg-avatar-3", // pink
  "bg-avatar-4", // teal
  "bg-avatar-5", // indigo
  "bg-avatar-6", // burnt orange
] as const;

/** Stable colour for a name: the same person always gets the same colour. */
export function avatarColour(name: string): string {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  // One word ("Mum", "Tobi") gets one initial, as chat apps do.
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const sizeClass = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-[12px]", // 32px, the bubble default
  lg: "size-10 text-[14px]",
  xl: "size-14 text-[18px]",
} as const;

const iconSize = { sm: "size-3.5", md: "size-4", lg: "size-5", xl: "size-7" } as const;
const px = { sm: 24, md: 32, lg: 40, xl: 56 } as const;

export function Avatar({
  sender,
  size = "md",
  decorative = false,
  className,
}: {
  sender: Sender;
  size?: keyof typeof sizeClass;
  /** True when the name is already shown next to it (e.g. in a bubble) */
  decorative?: boolean;
  className?: string;
}) {
  const a11y = decorative ? { "aria-hidden": true as const } : { role: "img", "aria-label": sender.name };
  const base = cn(
    "inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold leading-none select-none",
    sizeClass[size],
    className,
  );

  if (sender.system) {
    const mark = {
      sunpay: { cls: "bg-blue-600 text-white", node: <Wallet className={iconSize[size]} strokeWidth={1.8} /> },
      buzz: { cls: "bg-blue-600 text-white font-extrabold tracking-[-0.04em]", node: "B" },
      emba: { cls: "bg-alert-600 text-white", node: <ShieldAlert className={iconSize[size]} strokeWidth={1.8} /> },
    }[sender.system];
    return (
      <span {...a11y} data-placeholder="system-mark" className={cn(base, mark.cls)}>
        {mark.node}
      </span>
    );
  }

  if (sender.src) {
    return (
      <span {...a11y} className={cn(base, "bg-blue-50")}>
        <Image src={sender.src} alt="" width={px[size]} height={px[size]} className="size-full object-cover" />
      </span>
    );
  }

  return (
    <span {...a11y} className={cn(base, "text-ink-900", avatarColour(sender.name))}>
      {initials(sender.name)}
    </span>
  );
}
