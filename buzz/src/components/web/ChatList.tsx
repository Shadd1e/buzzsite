"use client";

import { BellOff, Check, CheckCheck, Clock3, Pin, Search, X } from "lucide-react";
import { Avatar } from "@/components/chat";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { cn } from "@/lib/cn";
import { webCopy } from "@/content/web";
import { listTime, preview, type LocalChat } from "./model";
import { CountBadge, ProTag } from "./ui";

export type ChatFilter = "all" | "unread" | "groups" | "pro";

/**
 * Chat list column (DESIGN.md §11): title with the bell top-right, search,
 * chips All · Unread · Groups · Pro, then rows (pinned first).
 */
export function ChatList({
  chats,
  selectedId,
  onSelect,
  filter,
  onFilter,
  search,
  onSearch,
  bell,
}: {
  chats: LocalChat[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: ChatFilter;
  onFilter: (f: ChatFilter) => void;
  search: string;
  onSearch: (q: string) => void;
  bell: React.ReactNode;
}) {
  const copy = webCopy.app;
  const q = search.trim().toLowerCase();
  const lastAt = (c: LocalChat) => c.messages.at(-1)?.at ?? "";
  const visible = chats
    .filter((c) => {
      if (filter === "unread" && c.unread === 0) return false;
      if (filter === "groups" && c.type !== "group") return false;
      if (filter === "pro" && !c.pro) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q));
    })
    .toSorted((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || lastAt(b).localeCompare(lastAt(a)));

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-5 pt-4 pb-3">
        <h1 className="mr-auto text-[28px] leading-tight font-medium">{copy.chats}</h1>
        <TestDataRibbon placement="docked" />
        {bell}
      </header>

      <div className="px-4">
        <label className="relative block">
          <span className="sr-only">{copy.search}</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-web-meta" strokeWidth={1.8} />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={copy.search}
            className="h-11 w-full rounded-full border border-transparent bg-web-raised pr-11 pl-11 text-[15px] text-web-text placeholder:text-web-meta focus:border-blue-600 focus:outline-3 focus:outline-offset-2 focus:outline-sky-400 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              aria-label="Clear search"
              className="absolute top-0 right-0 grid size-11 place-items-center rounded-full text-web-meta hover:text-web-text"
            >
              <X aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
            </button>
          )}
        </label>
        <div role="group" aria-label="Filter chats" className="flex gap-2 overflow-x-auto py-3">
          {copy.filters.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => onFilter(f.id)}
                className={cn(
                  "h-9 shrink-0 rounded-full px-3.5 text-[14px] font-medium transition-colors duration-(--dur-2) ease-out",
                  "relative after:absolute after:-inset-y-1 after:inset-x-0 after:content-['']",
                  on
                    ? "bg-web-text text-web-surface"
                    : "border border-web-line text-web-text hover:bg-web-hover",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="px-6 py-10 text-center text-[14px] text-web-meta">
          {q ? copy.noResults : copy.noFilterResults[filter]}
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Chats">
          {visible.map((c) => {
            const last = c.messages.at(-1);
            const mine = last?.from === "me";
            const who = c.type === "group" && last && !mine ? `${last.from}: ` : "";
            const selected = c.id === selectedId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={selected || undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-left transition-colors duration-(--dur-1) ease-out",
                    selected ? "bg-web-selected" : "hover:bg-web-hover",
                  )}
                >
                  <Avatar sender={{ name: c.name }} size="lg" decorative />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span className="truncate text-[15px] font-semibold">{c.name}</span>
                        {c.pro && <ProTag />}
                      </span>
                      {last && (
                        <span className={cn("shrink-0 text-[12px] tabular-nums", c.unread > 0 ? "font-semibold text-blue-600" : "text-web-meta")}>
                          {listTime(last.at)}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      {mine && last?.status && <ListTicks status={last.status} />}
                      <span className="min-w-0 flex-1 truncate text-[14px] text-web-meta">
                        {last ? who + preview(last) : copy.emptyChat}
                      </span>
                      {c.muted && <BellOff aria-label="Muted" className="size-4 shrink-0 text-web-meta" strokeWidth={1.8} />}
                      {c.pinned && <Pin aria-label="Pinned" className="size-4 shrink-0 text-web-meta" strokeWidth={1.8} />}
                      <CountBadge count={c.unread} label="unread" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Receipts in the list, on a plain surface: shape carries the state (one
 * tick, two ticks, clock), and read is blue as well (§2.2).
 */
function ListTicks({ status }: { status: NonNullable<LocalChat["messages"][number]["status"]> }) {
  const label = { pending: "Waiting to send", sent: "Sent", delivered: "Delivered", read: "Read" }[status];
  const Icon = status === "pending" ? Clock3 : status === "sent" ? Check : CheckCheck;
  return (
    <Icon
      role="img"
      aria-label={label}
      className={cn("size-4 shrink-0", status === "read" ? "text-blue-600" : "text-web-meta")}
      strokeWidth={2}
    />
  );
}
