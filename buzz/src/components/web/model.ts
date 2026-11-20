import type { Chat, ChatMessage, MessageStatus } from "@/lib/data/types";

/**
 * Buzz Web's local view of a chat. Messages get a stable id so the composer
 * can advance a sent message's ticks, and "pending" means queued while the
 * phone is offline (DESIGN.md §11).
 */
export type LocalStatus = MessageStatus | "pending";
export type LocalMessage = Omit<ChatMessage, "status"> & { id: string; status?: LocalStatus };
export type LocalChat = Omit<Chat, "messages"> & { messages: LocalMessage[] };

export function toLocal(chats: Chat[]): LocalChat[] {
  return chats.map((c) => ({
    ...c,
    messages: c.messages.map((m, i) => ({ ...m, id: `${c.id}-${i}` })),
  }));
}

export type ThemePref = "system" | "light" | "dark";
export type Theme = "light" | "dark";

const TZ = "Africa/Lagos";
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const time = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const shortDate = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short" });
const longDate = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });

function daysAgo(iso: string, now = new Date()): number {
  const a = new Date(dayKey.format(new Date(iso)));
  const b = new Date(dayKey.format(now));
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function formatClock(iso: string): string {
  return time.format(new Date(iso));
}

/** Chat list: "14:05" today, "Yesterday", then "17 Nov" */
export function listTime(iso: string): string {
  const d = daysAgo(iso);
  if (d <= 0) return formatClock(iso);
  if (d === 1) return "Yesterday";
  return shortDate.format(new Date(iso));
}

/** Day divider in a conversation: "Today", "Yesterday", "17 Nov 2026" */
export function dayLabel(iso: string): string {
  const d = daysAgo(iso);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return longDate.format(new Date(iso));
}

export function sameDay(a: string, b: string): boolean {
  return dayKey.format(new Date(a)) === dayKey.format(new Date(b));
}

/** One line for the chat list */
export function preview(m: LocalMessage): string {
  switch (m.kind) {
    case "voice":
      return `Voice note${m.duration ? ` (${m.duration})` : ""}`;
    case "sticker":
      return "Sticker";
    case "order":
      return `Order: ${m.item ?? "Depot order"}`;
    case "booking":
      return `Booking: ${m.when ?? ""}`.trim();
    default:
      return m.text;
  }
}
