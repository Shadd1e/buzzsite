"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DropdownMenu } from "radix-ui";
import { Check, CircleDot, FlaskConical, Lock, LogOut, MessagesSquare, Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { Avatar } from "@/components/chat";
import { Logo } from "@/components/Logo";
import { NotificationBanner } from "@/components/NotificationBanner";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/cn";
import { webCopy } from "@/content/web";
import type { Chat, PublicParcel, WebNotification, WebUpdate, WebUser } from "@/lib/data/types";
import { Bell } from "./Bell";
import { ChatList, type ChatFilter } from "./ChatList";
import { Conversation } from "./Conversation";
import { toLocal, type LocalChat, type LocalStatus, type Theme, type ThemePref } from "./model";
import { SidePanel, type Panel } from "./SidePanel";
import { UpdateDetail, UpdatesList } from "./Updates";
import { iconButton, menuItem, menuSurface } from "./ui";

/**
 * Buzz Web main layout (DESIGN.md §11). Desktop ≥1024px: chat list,
 * conversation and the info drawer side by side. Tablet: two panes, with the
 * drawer over the conversation. A narrow rail switches Chats and Updates and
 * holds theme, test controls and the account menu.
 */
export function ChatApp({
  me,
  chats: initialChats,
  notifications: initialNotifications,
  updates,
  tracking,
  theme,
  themePref,
  onThemeChange,
  onLogout,
  onExpire,
}: {
  me: WebUser;
  chats: Chat[];
  notifications: WebNotification[];
  updates: WebUpdate[];
  tracking: Record<string, PublicParcel>;
  theme: Theme;
  themePref: ThemePref;
  onThemeChange: (p: ThemePref) => void;
  onLogout: () => void;
  onExpire: () => void;
}) {
  const copy = webCopy.app;
  const toast = useToast();
  const [chats, setChats] = useState<LocalChat[]>(() => toLocal(initialChats));
  const [notifications, setNotifications] = useState(initialNotifications);
  const [view, setView] = useState<"chats" | "updates">("chats");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updateId, setUpdateId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ChatFilter>("all");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<Panel | null>(null);
  const [phoneOnline, setPhoneOnline] = useState(true);
  const [bannerOpen, setBannerOpen] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const selected = chats.find((c) => c.id === selectedId) ?? null;
  const unreadChats = chats.filter((c) => c.unread > 0).length;
  const priority = notifications.find((n) => n.priority && !n.read && n.trackingId);

  const setStatus = useCallback((chatId: string, msgId: string, status: LocalStatus) => {
    setChats((cs) =>
      cs.map((c) =>
        c.id !== chatId ? c : { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, status } : m)) },
      ),
    );
  }, []);

  /** Ticks advance like the phone confirms them: sent → delivered → read */
  const deliver = useCallback(
    (chatId: string, msgId: string) => {
      setStatus(chatId, msgId, "sent");
      timers.current.push(setTimeout(() => setStatus(chatId, msgId, "delivered"), 900));
      timers.current.push(setTimeout(() => setStatus(chatId, msgId, "read"), 2600));
    },
    [setStatus],
  );

  const send = useCallback(
    (chatId: string, text: string) => {
      const id = `${chatId}-local-${Date.now()}`;
      setChats((cs) =>
        cs.map((c) =>
          c.id !== chatId
            ? c
            : {
                ...c,
                messages: [
                  ...c.messages,
                  { id, from: "me", text, at: new Date().toISOString(), status: phoneOnline ? "sent" : "pending" },
                ],
              },
        ),
      );
      if (phoneOnline) deliver(chatId, id);
    },
    [phoneOnline, deliver],
  );

  /** Test toggle. When the phone reconnects, queued messages go out. */
  function changePhoneOnline(online: boolean) {
    setPhoneOnline(online);
    if (!online) return;
    for (const c of chats) for (const m of c.messages) if (m.status === "pending") deliver(c.id, m.id);
  }

  function openChat(id: string) {
    setSelectedId(id);
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    setPanel((p) => (p?.kind === "track" ? null : p));
  }

  function track(trackingId: string, item?: string) {
    setPanel((p) => ({ kind: "track", trackingId, item, back: p?.kind === "info" }));
  }

  function itemForTracking(id: string) {
    for (const c of chats) for (const m of c.messages) if (m.trackingId === id && m.item) return m.item;
    return undefined;
  }

  function openNotification(n: WebNotification) {
    setNotifications((ns) => ns.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.trackingId) {
      setView("chats");
      setPanel({ kind: "track", trackingId: n.trackingId, item: itemForTracking(n.trackingId) });
      if (priority?.id === n.id) setBannerOpen(false);
      return;
    }
    const chat = chats.find((c) => c.name === n.body);
    if (chat) {
      setView("chats");
      openChat(chat.id);
    }
  }

  const notAvailable = () => toast({ title: copy.notAvailable, tone: "info" });

  // Escape closes the drawer (it overlays the conversation on tablets)
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  const dark = theme === "dark";
  const ThemeIcon = themePref === "system" ? Monitor : themePref === "dark" ? Moon : Sun;

  return (
    <div className="flex h-full">
      {/* Rail */}
      <nav aria-label="Buzz Web" className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-web-line bg-web-surface py-3">
        <span className="mb-3">
          <Logo variant="mark" size="sm" />
        </span>
        <RailButton label={copy.chats} active={view === "chats"} onClick={() => setView("chats")} badge={unreadChats}>
          <MessagesSquare aria-hidden="true" className="size-[22px]" strokeWidth={1.7} />
        </RailButton>
        <RailButton label={copy.updates} active={view === "updates"} onClick={() => setView("updates")} dot={updates.some((u) => u.kind === "security")}>
          <CircleDot aria-hidden="true" className="size-[22px]" strokeWidth={1.7} />
        </RailButton>

        <div className="mt-auto flex flex-col items-center gap-1">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={cn(iconButton, "text-warn-700")} aria-label={copy.test.label} title={copy.test.label}>
              <FlaskConical aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="right" align="end" sideOffset={8} data-theme={theme} className={cn(menuSurface, "web-shell")}>
                <DropdownMenu.Label className="px-3 pt-2 pb-1 text-[13px] font-semibold text-warn-700">{copy.test.label}</DropdownMenu.Label>
                <DropdownMenu.CheckboxItem
                  checked={!phoneOnline}
                  onCheckedChange={(v) => changePhoneOnline(!v)}
                  className={menuItem}
                >
                  <span className="grid size-[18px] place-items-center">
                    <DropdownMenu.ItemIndicator>
                      <Check aria-hidden="true" className="size-4" strokeWidth={2} />
                    </DropdownMenu.ItemIndicator>
                  </span>
                  {copy.test.offline}
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.Item className={menuItem} onSelect={onExpire}>
                  <span className="size-[18px]" />
                  {copy.test.expire}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={iconButton} aria-label={`${copy.theme.label}: ${copy.theme[themePref]}`} title={copy.theme.label}>
              <ThemeIcon aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="right" align="end" sideOffset={8} data-theme={theme} className={cn(menuSurface, "web-shell")}>
                <DropdownMenu.Label className="flex items-center gap-2 px-3 pt-2 pb-1 text-[13px] font-semibold text-web-meta">
                  <SunMoon aria-hidden="true" className="size-4" strokeWidth={1.8} />
                  {copy.theme.label}
                </DropdownMenu.Label>
                <DropdownMenu.RadioGroup value={themePref} onValueChange={(v) => onThemeChange(v as ThemePref)}>
                  {(["system", "light", "dark"] as const).map((p) => (
                    <DropdownMenu.RadioItem key={p} value={p} className={menuItem}>
                      <span className="grid size-[18px] place-items-center">
                        <DropdownMenu.ItemIndicator>
                          <Check aria-hidden="true" className="size-4" strokeWidth={2} />
                        </DropdownMenu.ItemIndicator>
                      </span>
                      {copy.theme[p]}
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={cn(iconButton, "mt-1")} aria-label={`${me.name}, account`}>
              <Avatar sender={{ name: me.name }} size="md" decorative />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="right" align="end" sideOffset={8} data-theme={theme} className={cn(menuSurface, "web-shell")}>
                <div className="px-3 pt-2 pb-2">
                  <p className="text-[15px] font-semibold">{me.name}</p>
                  <p className="code-text text-[13px] text-web-meta">{me.buzzId}</p>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-web-line" />
                <DropdownMenu.Item className={menuItem} onSelect={onLogout}>
                  <LogOut aria-hidden="true" className="size-[18px] text-web-meta" strokeWidth={1.8} />
                  {copy.menu.logout}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </nav>

      {/* List column */}
      <div className="w-[320px] shrink-0 border-r border-web-line bg-web-surface lg:w-[360px] xl:w-[400px]">
        {view === "chats" ? (
          <ChatList
            chats={chats}
            selectedId={selectedId}
            onSelect={openChat}
            filter={filter}
            onFilter={setFilter}
            search={search}
            onSearch={setSearch}
            bell={
              <Bell
                items={notifications}
                theme={theme}
                onOpenItem={openNotification}
                onMarkAllRead={() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))}
              />
            }
          />
        ) : (
          <UpdatesList updates={updates} selectedId={updateId} onSelect={setUpdateId} />
        )}
      </div>

      {/* Main + drawer */}
      <div className="relative flex min-w-0 flex-1">
        <div className="relative min-w-0 flex-1">
          {view === "updates" ? (
            <UpdateDetail update={updates.find((u) => u.id === updateId) ?? null} theme={theme} />
          ) : selected ? (
            <Conversation
              chat={selected}
              theme={theme}
              phoneOnline={phoneOnline}
              infoOpen={panel?.kind === "info"}
              onToggleInfo={() => setPanel((p) => (p?.kind === "info" ? null : { kind: "info" }))}
              onSend={(text) => send(selected.id, text)}
              onShareId={() => send(selected.id, `My Buzz ID is ${me.buzzId}`)}
              onTrack={track}
              onNotAvailable={notAvailable}
            />
          ) : (
            <Welcome phoneOnline={phoneOnline} />
          )}

          {/* Priority delivery update as a glass banner (§11) */}
          {priority && bannerOpen && view === "chats" && (
            <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex justify-center px-4">
              <NotificationBanner
                tone="delivery"
                title={priority.title}
                body={priority.body}
                action={{ label: "Track", onClick: () => openNotification(priority) }}
                onDismiss={() => setBannerOpen(false)}
                className="pointer-events-auto"
              />
            </div>
          )}
        </div>

        {panel && (panel.kind === "track" || selected) && (
          <div
            className={cn(
              "z-30 w-[360px] shrink-0 border-l border-web-line",
              // Tablet: over the conversation; desktop: its own pane
              "absolute inset-y-0 right-0 shadow-float lg:static lg:shadow-none",
              dark && "border-dark-raised",
            )}
          >
            <SidePanel
              panel={panel}
              chat={selected}
              tracking={tracking}
              theme={theme}
              onClose={() => setPanel(null)}
              onBack={() => setPanel({ kind: "info" })}
              onTrack={track}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function RailButton({
  label,
  active,
  onClick,
  badge = 0,
  dot,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={badge ? `${label}, ${badge} unread` : label}
      title={label}
      className={cn(
        "relative grid size-11 place-items-center rounded-full transition-colors duration-(--dur-1) ease-out",
        active ? "bg-web-selected text-web-text" : "text-web-meta hover:bg-web-hover hover:text-web-text",
      )}
    >
      {children}
      {badge > 0 && (
        <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-600 px-1 text-[11px] leading-none font-semibold text-white ring-2 ring-web-surface">
          {badge}
        </span>
      )}
      {dot && !badge && (
        <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-alert-600 ring-2 ring-web-surface" />
      )}
    </button>
  );
}

function Welcome({ phoneOnline }: { phoneOnline: boolean }) {
  const copy = webCopy.app;
  return (
    <div className="flex h-full flex-col items-center justify-center bg-web-convo px-8 text-center">
      <Logo variant="mark" size="lg" />
      <h2 className="mt-6 text-[28px] leading-tight font-medium">{copy.welcome.title}</h2>
      <p className="mt-3 max-w-[30em] text-[15px] leading-relaxed text-web-meta">{copy.welcome.body}</p>
      {!phoneOnline && (
        <NotificationBanner tone="offline" title={copy.offline.title} body={copy.offline.body} className="mt-6" />
      )}
      <p className="mt-10 flex items-center gap-2 text-[13px] text-web-meta">
        <Lock aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
        {webCopy.pairing.encrypted}
      </p>
    </div>
  );
}
