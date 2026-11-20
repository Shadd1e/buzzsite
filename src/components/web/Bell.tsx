"use client";

import { useState } from "react";
import { Popover } from "radix-ui";
import { AtSign, Bell as BellIcon, Truck, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { webCopy } from "@/content/web";
import type { WebNotification } from "@/lib/data/types";
import { listTime } from "./model";
import { iconButton, menuSurface } from "./ui";

const kindIcon: Record<string, LucideIcon> = { delivery: Truck, escrow: Wallet, mention: AtSign };

/**
 * The notification bell, top-right of the chat list (DESIGN.md §11).
 * Delivery updates are priority: pinned to the top with a blue pill.
 * Choosing one opens the order tracking panel.
 */
export function Bell({
  items,
  theme,
  onOpenItem,
  onMarkAllRead,
}: {
  items: WebNotification[];
  theme: "light" | "dark";
  onOpenItem: (n: WebNotification) => void;
  onMarkAllRead: () => void;
}) {
  const copy = webCopy.app.bell;
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;
  const sorted = items.toSorted((a, b) => Number(b.priority) - Number(a.priority) || b.at.localeCompare(a.at));

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={iconButton} aria-label={unread ? `${copy.title}, ${unread} unread` : copy.title}>
        <BellIcon aria-hidden="true" className="size-5" strokeWidth={1.8} />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-600 px-1 text-[11px] leading-none font-semibold text-white ring-2 ring-web-surface"
          >
            {unread}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          data-theme={theme}
          className={cn(menuSurface, "web-shell w-[380px] p-0")}
        >
          <div className="flex items-center justify-between gap-3 border-b border-web-line py-1.5 pr-1.5 pl-4">
            <p className="text-[16px] font-semibold">{copy.title}</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="min-h-11 rounded-full px-3 text-[13px] font-semibold text-blue-600 hover:bg-web-hover"
              >
                {copy.markRead}
              </button>
            )}
          </div>
          {sorted.length === 0 ? (
            <p className="px-4 py-8 text-center text-[14px] text-web-meta">{copy.empty}</p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto p-1.5">
              {sorted.map((n) => {
                const Icon = kindIcon[n.kind] ?? BellIcon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenItem(n);
                        setOpen(false);
                      }}
                      className="flex w-full gap-3 rounded-tile p-3 text-left hover:bg-web-hover"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-tile",
                          n.priority ? "bg-blue-600 text-white" : "bg-web-raised text-web-meta",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={cn("min-w-0 flex-1 truncate text-[15px]", n.read ? "font-medium" : "font-semibold")}>
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[12px] text-web-meta tabular-nums">{listTime(n.at)}</span>
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-web-meta">{n.body}</span>
                        {n.priority && (
                          <span className="mt-2 inline-flex h-6 items-center rounded-full bg-blue-600 px-2.5 text-[12px] font-semibold text-white">
                            {copy.delivery}
                          </span>
                        )}
                      </span>
                      {!n.read && (
                        <span className="mt-2 size-2.5 shrink-0 rounded-full bg-blue-600">
                          <span className="sr-only">Unread</span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
