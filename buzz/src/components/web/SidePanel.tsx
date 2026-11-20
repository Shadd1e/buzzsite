"use client";

import { ArrowLeft, Briefcase, X } from "lucide-react";
import { Avatar, Bubble } from "@/components/chat";
import { Code } from "@/components/Code";
import { StatusPill } from "@/components/StatusPill";
import { cn } from "@/lib/cn";
import { webCopy } from "@/content/web";
import type { PublicParcel } from "@/lib/data/types";
import { formatClock, listTime, type LocalChat, type Theme } from "./model";
import { IconButton } from "./ui";

export type Panel = { kind: "info" } | { kind: "track"; trackingId: string; item?: string; back?: boolean };

/**
 * The right-hand drawer (DESIGN.md §11). Info: Buzz ID or Pro ID, members,
 * media, shared orders. Tracking: the public view only, so never a rider's
 * name, phone or location (PRODUCT.md logistics privacy rule).
 */
export function SidePanel({
  panel,
  chat,
  tracking,
  theme,
  onClose,
  onBack,
  onTrack,
}: {
  panel: Panel;
  chat: LocalChat | null;
  tracking: Record<string, PublicParcel>;
  theme: Theme;
  onClose: () => void;
  onBack: () => void;
  onTrack: (trackingId: string, item?: string) => void;
}) {
  const copy = webCopy.app;
  const title = panel.kind === "info" ? copy.info.title : copy.tracking.title;

  return (
    <aside aria-labelledby="panel-title" className="flex h-full flex-col bg-web-surface">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-web-line px-3">
        {panel.kind === "track" && panel.back ? (
          <IconButton label="Back to chat info" onClick={onBack}>
            <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </IconButton>
        ) : null}
        <h2 id="panel-title" className="mr-auto pl-2 text-[18px] font-semibold">
          {title}
        </h2>
        <IconButton label={`Close ${title.toLowerCase()}`} onClick={onClose}>
          <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </IconButton>
      </header>
      <div className="flex-1 overflow-y-auto">
        {panel.kind === "info" && chat && <Info chat={chat} tracking={tracking} theme={theme} onTrack={onTrack} />}
        {panel.kind === "track" && (
          <Tracking parcel={tracking[panel.trackingId]} trackingId={panel.trackingId} item={panel.item} theme={theme} />
        )}
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-web-line px-5 py-5">
      <h3 className="mb-3 text-[14px] font-semibold text-web-meta">{title}</h3>
      {children}
    </section>
  );
}

function Info({
  chat,
  tracking,
  theme,
  onTrack,
}: {
  chat: LocalChat;
  tracking: Record<string, PublicParcel>;
  theme: Theme;
  onTrack: (trackingId: string, item?: string) => void;
}) {
  const copy = webCopy.app.info;
  const orders = chat.messages.filter((m) => m.kind === "order" && m.trackingId);
  const members =
    chat.type === "group"
      ? [...new Set(chat.messages.map((m) => (m.from === "me" ? "You" : m.from)))].toSorted((a, b) =>
          a === "You" ? 1 : b === "You" ? -1 : a.localeCompare(b),
        )
      : [];

  return (
    <>
      <div className="flex flex-col items-center px-5 pt-8 pb-6 text-center">
        <Avatar sender={{ name: chat.name }} size="xl" decorative className="size-24 text-[30px]" />
        <p className="mt-4 text-[20px] font-semibold">{chat.name}</p>
        {chat.type === "group" ? (
          <p className="mt-1 text-[14px] text-web-meta">{chat.members} members</p>
        ) : (
          chat.buzzId && <Code value={chat.buzzId} label={chat.pro ? "Pro ID" : "Buzz ID"} size="sm" showLabel className="mt-3" />
        )}
      </div>

      {chat.pro && (
        <Section title={copy.pro}>
          <p className="flex gap-3 text-[14px] leading-relaxed">
            <Briefcase aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-blue-600" strokeWidth={1.8} />
            {copy.proBody}
          </p>
        </Section>
      )}

      {chat.type === "group" && (
        <Section title={copy.members}>
          <ul className="flex flex-col gap-1">
            {members.map((n) => (
              <li key={n} className="flex min-h-11 items-center gap-3 text-[15px]">
                <Avatar sender={{ name: n }} size="md" decorative />
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-web-meta">People who posted recently. [Full member list: not in test data]</p>
        </Section>
      )}

      <Section title={copy.media}>
        <p className="text-[14px] text-web-meta">{copy.mediaEmpty}</p>
      </Section>

      <Section title={copy.orders}>
        {orders.length === 0 ? (
          <p className="text-[14px] text-web-meta">{copy.ordersEmpty}</p>
        ) : (
          <ul className="divide-y divide-web-line">
            {orders.map((m) => {
              const status = tracking[m.trackingId!]?.status ?? m.orderStatus;
              return (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{m.item}</p>
                    <p className="code-text text-[13px] text-web-meta">{m.trackingId}</p>
                    {status && <StatusPill status={status} size="sm" theme={theme} className="mt-1.5" />}
                  </div>
                  <button
                    type="button"
                    onClick={() => onTrack(m.trackingId!, m.item)}
                    className="min-h-11 shrink-0 rounded-full border-[1.5px] border-web-line px-4 text-[14px] font-semibold hover:border-web-text"
                  >
                    Track
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}

function Tracking({
  parcel,
  trackingId,
  item,
  theme,
}: {
  parcel: PublicParcel | undefined;
  trackingId: string;
  item?: string;
  theme: Theme;
}) {
  const copy = webCopy.app.tracking;
  if (!parcel) return <p className="px-5 py-8 text-[14px] text-web-meta">{copy.notFound}</p>;
  const dark = theme === "dark";
  return (
    <>
      <div className="px-5 pt-6 pb-5">
        {item && <p className="text-[20px] leading-snug font-semibold">{item}</p>}
        <StatusPill status={parcel.status} theme={theme} className="mt-3" />
        <div className="mt-4">
          <Code value={trackingId} label="Tracking ID" size="sm" />
        </div>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]">
          <dt className="text-web-meta">{copy.partner}</dt>
          <dd className="font-medium">{parcel.partnerName}</dd>
          {parcel.route.length > 1 && (
            <>
              <dt className="text-web-meta">Route</dt>
              <dd className="font-medium">{parcel.route.join(" to ")}</dd>
            </>
          )}
          {parcel.lastScan && (
            <>
              <dt className="text-web-meta">{copy.lastScan}</dt>
              <dd className="font-medium">
                {parcel.lastScan.city}, {listTime(parcel.lastScan.at)} {formatClock(parcel.lastScan.at)}
              </dd>
            </>
          )}
        </dl>
        {parcel.nextStep && (
          <p className={cn("mt-5 rounded-field px-4 py-3 text-[14px] leading-relaxed", dark ? "bg-dark-raised" : "bg-blue-50 text-ink-900")}>
            {parcel.nextStep}
          </p>
        )}
        <p className="mt-4 text-[13px] leading-relaxed text-web-meta">{copy.codeNote}</p>
      </div>

      <Section title={copy.history}>
        <ol className="flex flex-col gap-2">
          {parcel.timeline.map((e, i) => (
            <li key={`${e.at}-${i}`}>
              <Bubble variant="system" sender={{ name: parcel.partnerName, system: "buzz" }} showName={false} time={`${listTime(e.at)}, ${formatClock(e.at)}`} theme={theme}>
                <span className="text-[15px]">
                  {e.label}
                  {e.city ? ` in ${e.city}` : ""}
                </span>
              </Bubble>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
