"use client";

import { QRCodeSVG } from "qrcode.react";
import { ScanLine, Search, ShieldAlert } from "lucide-react";
import { Avatar } from "@/components/chat";
import { cn } from "@/lib/cn";

/**
 * Phone screens for The App feature stage (DESIGN.md §9.2). Real Buzz UI built
 * in HTML from sample data, no status bar. Illustrative, not screenshots.
 */

export interface ChatPreview {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: number;
}

function ScreenHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-3">
      <p className="text-[22px] font-semibold tracking-[-0.01em] text-ink-900">{title}</p>
      {action}
    </div>
  );
}

export function ChatsScreen({ chats }: { chats: ChatPreview[] }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Chats" />
      <div className="mx-4 mb-2 flex h-9 items-center gap-2 rounded-full bg-mist px-3 text-[13px] text-ink-500">
        <Search aria-hidden="true" className="size-4" strokeWidth={1.8} />
        Search
      </div>
      <ul className="flex-1 divide-y divide-line overflow-hidden">
        {chats.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
            <Avatar sender={{ name: c.name }} size="lg" decorative />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[14px] font-semibold text-ink-900">{c.name}</p>
                <span className={cn("shrink-0 text-[11px] tabular-nums", c.unread ? "text-blue-600" : "text-ink-500")}>{c.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[13px] text-ink-500">{c.last}</p>
                {c.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white tabular-nums">
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BuzzIdScreen({ name, handle }: { name: string; handle: string }) {
  return (
    <div className="flex h-full flex-col items-center bg-white px-6 pt-10 text-center">
      <Avatar sender={{ name }} size="xl" decorative />
      <p className="mt-4 text-[20px] font-semibold text-ink-900">{name}</p>
      <p className="code-text mt-2 rounded-full bg-blue-50 px-4 py-2 text-[16px] text-ink-900">{handle}</p>
      <p className="mt-5 text-[13px] leading-relaxed text-ink-500">
        People who have your Buzz ID can message you. Your phone number is never shown.
      </p>
      <div className="mt-auto mb-6 w-full rounded-field border border-line p-3 text-left">
        <p className="text-[12px] text-ink-500">Phone number</p>
        <p className="text-[14px] font-medium text-ink-900">Hidden from everyone</p>
      </div>
    </div>
  );
}

export function BuzzDropScreen({ handle }: { handle: string }) {
  return (
    <div className="flex h-full flex-col items-center bg-navy px-6 pt-8 text-center">
      <p className="text-[18px] font-semibold text-white">BuzzDrop</p>
      <p className="mt-1 text-[13px] text-ink-300">Let them scan your code</p>
      <div className="mt-8 rounded-panel bg-white p-5">
        {/* Sample payload: illustrative, not a real pairing code */}
        <QRCodeSVG value={`buzzdrop:${handle}:sample`} size={150} level="M" fgColor="currentColor" className="text-ink-900" />
      </div>
      <p className="code-text mt-5 text-[15px] text-white">{handle}</p>
      <div className="mt-auto mb-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-sky-400 text-[14px] font-semibold text-ink-900">
        <ScanLine aria-hidden="true" className="size-4" strokeWidth={1.8} />
        Scan their code
      </div>
    </div>
  );
}

export function StatusScreen({ people }: { people: string[] }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Updates" />
      <p className="px-4 pb-2 text-[12px] font-semibold text-alert-700">Security updates</p>
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-field border-2 border-alert-600 bg-alert-50 p-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-alert-600 text-white">
          <ShieldAlert aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink-900">[Verified agency]</p>
          <p className="truncate text-[12px] text-alert-700">Road blocked at [location]</p>
        </div>
      </div>
      <p className="px-4 pb-2 text-[12px] font-semibold text-ink-500">Recent</p>
      <ul className="flex flex-col gap-1 px-4">
        {people.map((p, i) => (
          <li key={p} className="flex items-center gap-3 py-1.5">
            <span className="rounded-full p-[2px] ring-2 ring-blue-600">
              <Avatar sender={{ name: p }} size="lg" decorative />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-ink-900">{p}</p>
              <p className="text-[12px] text-ink-500">{["12 minutes ago", "1 hour ago", "This morning", "Yesterday, 21:40"][i] ?? "Today"}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
