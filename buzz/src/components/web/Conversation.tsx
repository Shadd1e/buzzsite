"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { DropdownMenu } from "radix-ui";
import { AtSign, CalendarCheck, FileText, Image as ImageIcon, Lock, Mic, PanelRight, Plus, SendHorizontal, Sticker } from "lucide-react";
import { Avatar, Bubble, VoiceNote, type Sender } from "@/components/chat";
import { NotificationBanner } from "@/components/NotificationBanner";
import { OrderCard } from "@/components/OrderCard";
import { cn } from "@/lib/cn";
import { webCopy } from "@/content/web";
import { dayLabel, formatClock, sameDay, type LocalChat, type LocalMessage, type Theme } from "./model";
import { IconButton, ProTag, iconButton, menuItem, menuSurface } from "./ui";

/**
 * The conversation pane (DESIGN.md §11): header with avatar, name and status;
 * bubbles from the shared system; composer with + · text · voice. Order
 * messages render as order cards. The offline banner sits under the header.
 */
export function Conversation({
  chat,
  theme,
  phoneOnline,
  infoOpen,
  onToggleInfo,
  onSend,
  onShareId,
  onTrack,
  onNotAvailable,
}: {
  chat: LocalChat;
  theme: Theme;
  phoneOnline: boolean;
  infoOpen: boolean;
  onToggleInfo: () => void;
  onSend: (text: string) => void;
  onShareId: () => void;
  onTrack: (trackingId: string, item?: string) => void;
  onNotAvailable: () => void;
}) {
  const copy = webCopy.app;
  const scroller = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);

  // Open at the newest message, and follow new ones
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.id, chat.messages.length]);

  // A new chat starts with an empty composer. Focus stays where the person
  // put it (moving it into a text field would show the focus ring at rest).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset per chat
    setDraft("");
  }, [chat.id]);

  // Grow the composer up to ~6 lines
  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  const subtitle =
    chat.type === "group"
      ? `${chat.members ?? "Group"} members`
      : chat.pro
        ? `Pro ID ${chat.buzzId ?? ""}`.trim()
        : (chat.buzzId ?? "");

  return (
    <div className="flex h-full min-w-0 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-web-line bg-web-surface px-4">
        <button
          type="button"
          onClick={onToggleInfo}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-field py-1 text-left"
          aria-label={`${chat.name}: chat info`}
        >
          <Avatar sender={{ name: chat.name }} size="lg" decorative />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <h2 className="truncate text-[16px] font-semibold">{chat.name}</h2>
              {chat.pro && <ProTag />}
            </span>
            <span className="block truncate text-[13px] text-web-meta">{subtitle}</span>
          </span>
        </button>
        <IconButton label={copy.info.title} aria-pressed={infoOpen} onClick={onToggleInfo}>
          <PanelRight aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </IconButton>
      </header>

      {!phoneOnline && (
        <div className="shrink-0 border-b border-warn-700/15 bg-warn-50 px-4 py-2">
          <NotificationBanner tone="offline" title={copy.offline.title} body={copy.offline.body} className="max-w-none border-0 bg-transparent p-0" />
        </div>
      )}

      <div
        ref={scroller}
        role="log"
        aria-label={`Messages with ${chat.name}`}
        className="flex-1 overflow-y-auto bg-web-convo px-4 py-5 lg:px-[6%]"
      >
        <p className="mx-auto mb-5 flex w-fit max-w-full items-center gap-2 rounded-tile bg-web-surface px-3 py-1.5 text-center text-[12px] text-web-meta">
          <Lock aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.8} />
          {chat.messages.length ? webCopy.pairing.encrypted : copy.emptyChat}
        </p>
        <div className="flex flex-col gap-2">
          {chat.messages.map((m, i) => {
            const prev = chat.messages[i - 1];
            const newDay = !prev || !sameDay(prev.at, m.at);
            return (
              <Fragment key={m.id}>
                {newDay && (
                  <p className="sticky top-0 z-10 mx-auto my-2 w-fit rounded-full bg-web-surface px-3 py-1 text-[12px] font-medium text-web-meta shadow-hair">
                    {dayLabel(m.at)}
                  </p>
                )}
                <Message chat={chat} m={m} theme={theme} onTrack={onTrack} />
              </Fragment>
            );
          })}
        </div>
      </div>

      <footer className="flex shrink-0 items-end gap-2 border-t border-web-line bg-web-surface px-3 py-2.5">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={iconButton} aria-label="Attach">
            <Plus aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="top" align="start" sideOffset={8} className={cn(menuSurface, "web-shell")} data-theme={theme}>
              <DropdownMenu.Item className={menuItem} onSelect={onNotAvailable}>
                <ImageIcon aria-hidden="true" className="size-[18px] text-web-meta" strokeWidth={1.8} />
                Photo or video
              </DropdownMenu.Item>
              <DropdownMenu.Item className={menuItem} onSelect={onNotAvailable}>
                <FileText aria-hidden="true" className="size-[18px] text-web-meta" strokeWidth={1.8} />
                Document
              </DropdownMenu.Item>
              <DropdownMenu.Item className={menuItem} onSelect={onShareId}>
                <AtSign aria-hidden="true" className="size-[18px] text-web-meta" strokeWidth={1.8} />
                Share my Buzz ID
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <label className="min-w-0 flex-1">
          <span className="sr-only">{copy.composer}</span>
          <textarea
            ref={input}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={copy.composer}
            className="block max-h-40 min-h-11 w-full resize-none rounded-field bg-web-raised px-4 py-[11px] text-[15px] leading-[22px] text-web-text placeholder:text-web-meta focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          />
        </label>

        {draft.trim() ? (
          <button
            type="button"
            onClick={send}
            aria-label="Send"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-600 text-white transition-colors duration-(--dur-1) ease-out hover:bg-blue-700"
          >
            <SendHorizontal aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </button>
        ) : (
          <IconButton label="Record a voice note" onClick={onNotAvailable}>
            <Mic aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </IconButton>
        )}
      </footer>
    </div>
  );
}

function Message({
  chat,
  m,
  theme,
  onTrack,
}: {
  chat: LocalChat;
  m: LocalMessage;
  theme: Theme;
  onTrack: (trackingId: string, item?: string) => void;
}) {
  const mine = m.from === "me";
  const sender: Sender = { name: chat.type === "group" ? m.from : chat.name };
  const time = formatClock(m.at);
  const dark = theme === "dark";

  // Order cards sit in the chat on their own, not inside a bubble (no nested cards)
  if (m.kind === "order" && m.trackingId && m.orderStatus) {
    return (
      <div className={cn("flex items-end gap-2", mine && "justify-end")}>
        {!mine && <Avatar sender={sender} size="md" decorative />}
        <div className="w-full max-w-[340px]">
          {!mine && <span className="sr-only">{sender.name}: </span>}
          <OrderCard
            item={m.item ?? "Depot order"}
            status={m.orderStatus}
            trackingId={m.trackingId}
            theme={theme}
            onTrack={() => onTrack(m.trackingId!, m.item)}
          />
          <p className="mt-1 px-1 text-[12px] text-web-meta tabular-nums">
            <time>{time}</time>
          </p>
        </div>
      </div>
    );
  }

  if (m.kind === "sticker") {
    return (
      <div className={cn("flex items-end gap-2", mine && "justify-end")}>
        {!mine && <Avatar sender={sender} size="md" decorative />}
        <div>
          <span className="sr-only">{mine ? "You" : sender.name} sent a sticker</span>
          <span
            aria-hidden="true"
            data-placeholder="sticker"
            className="grid size-28 place-items-center rounded-card border border-dashed border-web-line bg-web-surface text-web-meta"
          >
            <Sticker className="size-8" strokeWidth={1.4} />
          </span>
          <p className="mt-1 px-1 text-[12px] text-web-meta tabular-nums">
            <time>{time}</time>
          </p>
        </div>
      </div>
    );
  }

  let content: React.ReactNode = m.text;
  if (m.kind === "voice") content = <VoiceNote duration={m.duration ?? "0:00"} tone={mine ? "out" : "in"} />;
  if (m.kind === "booking")
    content = (
      <span className="flex items-center gap-3">
        <span aria-hidden="true" className={cn("grid size-10 shrink-0 place-items-center rounded-tile", dark ? "bg-dark-raised text-sky-400" : "bg-blue-50 text-blue-600")}>
          <CalendarCheck className="size-5" strokeWidth={1.8} />
        </span>
        <span>
          <span className={cn("block text-[13px]", dark ? "text-dark-meta" : "text-ink-500")}>Booking</span>
          <span className="block font-semibold">{m.when}</span>
        </span>
      </span>
    );

  return mine ? (
    <Bubble variant="out" time={time} status={m.status} theme={theme}>
      {content}
    </Bubble>
  ) : (
    <Bubble variant="in" sender={sender} showName={chat.type === "group"} time={time} theme={theme} onTint={!dark}>
      {content}
    </Bubble>
  );
}
