import { db, respond } from "./source";
import type { Chat, WebNotification, WebUpdate, WebUser } from "./types";

export async function getMe(): Promise<WebUser> {
  return respond(db.web.me);
}

/** Pinned chats first, then most recent message first. */
export async function listChats(filter?: {
  type?: Chat["type"];
  unread?: boolean;
  pro?: boolean;
}): Promise<Chat[]> {
  const lastAt = (c: Chat) => c.messages.at(-1)?.at ?? "";
  const items = db.web.chats
    .filter(
      (c) =>
        (!filter?.type || c.type === filter.type) &&
        (!filter?.unread || c.unread > 0) &&
        (!filter?.pro || c.pro === true),
    )
    .toSorted((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || lastAt(b).localeCompare(lastAt(a)));
  return respond(items);
}

export async function getChat(chatId: string): Promise<Chat | null> {
  return respond(db.web.chats.find((c) => c.id === chatId) ?? null);
}

/** Delivery updates are priority: they pin to the top (DESIGN.md §11). */
export async function listNotifications(): Promise<WebNotification[]> {
  const items = db.web.notifications.toSorted(
    (a, b) => Number(b.priority) - Number(a.priority) || b.at.localeCompare(a.at),
  );
  return respond(items);
}

export async function listUpdates(filter?: { kind?: WebUpdate["kind"] }): Promise<WebUpdate[]> {
  return respond(db.web.updates.filter((u) => !filter?.kind || u.kind === filter.kind));
}
