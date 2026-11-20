"use client";

import { BadgeCheck, CircleDashed, Phone, ShieldAlert } from "lucide-react";
import { Avatar, Bubble } from "@/components/chat";
import { cn } from "@/lib/cn";
import { webCopy } from "@/content/web";
import type { WebUpdate } from "@/lib/data/types";
import { formatClock, listTime, type Theme } from "./model";

/**
 * The Updates view (DESIGN.md §11): security updates in their own group,
 * in the alert colour, separate from Status posts (which last 24 hours).
 */
export function UpdatesList({
  updates,
  selectedId,
  onSelect,
}: {
  updates: WebUpdate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const copy = webCopy.app;
  const security = updates.filter((u) => u.kind === "security");
  const status = updates.filter((u) => u.kind === "status");

  const row = (u: WebUpdate) => {
    const selected = u.id === selectedId;
    return (
      <li key={u.id}>
        <button
          type="button"
          onClick={() => onSelect(u.id)}
          aria-current={selected || undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-left transition-colors duration-(--dur-1) ease-out",
            selected ? "bg-web-selected" : "hover:bg-web-hover",
          )}
        >
          {u.kind === "security" ? (
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-alert-600 text-white">
              <ShieldAlert className="size-5" strokeWidth={1.8} />
            </span>
          ) : (
            <span aria-hidden="true" className="rounded-full p-0.5 ring-2 ring-blue-600">
              <Avatar sender={{ name: u.name }} size="md" decorative />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                {u.kind === "security" ? u.source : u.name}
              </span>
              <span className="shrink-0 text-[12px] text-web-meta tabular-nums">{listTime(u.at)}</span>
            </span>
            <span className="mt-0.5 block truncate text-[14px] text-web-meta">{u.text}</span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pt-4 pb-3">
        <h1 className="text-[28px] leading-tight font-medium">{copy.updates}</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <section aria-labelledby="sec-title" className="mb-4">
          <h2 id="sec-title" className="flex items-center gap-2 px-3 pt-2 text-[14px] font-semibold text-alert-700 [[data-theme=dark]_&]:text-alert-50">
            <ShieldAlert aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {copy.updatesView.security}
          </h2>
          <p className="px-3 pb-2 text-[13px] text-web-meta">{copy.updatesView.securityHint}</p>
          <ul>{security.map(row)}</ul>
        </section>
        <section aria-labelledby="status-title">
          <h2 id="status-title" className="flex items-center gap-2 px-3 pt-2 text-[14px] font-semibold text-web-meta">
            <CircleDashed aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {copy.updatesView.status}
          </h2>
          <p className="px-3 pb-2 text-[13px] text-web-meta">{copy.updatesView.statusHint}</p>
          <ul>{status.map(row)}</ul>
        </section>
      </div>
    </div>
  );
}

export function UpdateDetail({ update, theme }: { update: WebUpdate | null; theme: Theme }) {
  const copy = webCopy.app.updatesView;
  if (!update) {
    return (
      <div className="grid h-full place-items-center bg-web-convo px-6">
        <p className="text-[15px] text-web-meta">{copy.pick}</p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col bg-web-convo">
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center gap-4 px-6 py-10">
        {update.kind === "security" ? (
          <>
            <Bubble variant="alert" sender={{ name: "Security update", system: "emba" }} time={formatClock(update.at)} theme={theme}>
              <span className="block">{update.text}</span>
              <span className="mt-1.5 block text-[13px] opacity-80">{update.area}</span>
            </Bubble>
            <p className="flex items-center gap-2 pl-10 text-[13px] text-web-meta">
              {update.verified && <BadgeCheck aria-hidden="true" className="size-4 text-ok-600" strokeWidth={1.8} />}
              {update.verified ? `${copy.verified}: ${update.source}` : update.source}
            </p>
            <a
              href="tel:112"
              className="mt-4 inline-flex min-h-11 w-fit items-center gap-2 self-center rounded-full border-2 border-alert-600 px-5 text-[14px] font-semibold text-alert-700 hover:bg-alert-50 [[data-theme=dark]_&]:text-alert-50 [[data-theme=dark]_&]:hover:bg-alert-600/20"
            >
              <Phone aria-hidden="true" className="size-4" strokeWidth={1.8} />
              In an emergency, call 112
            </a>
          </>
        ) : (
          <>
            <Bubble variant="in" sender={{ name: update.name }} showName time={formatClock(update.at)} theme={theme}>
              {update.text}
            </Bubble>
            <p className="pl-10 text-[13px] text-web-meta">{copy.statusHint}</p>
          </>
        )}
      </div>
    </div>
  );
}
