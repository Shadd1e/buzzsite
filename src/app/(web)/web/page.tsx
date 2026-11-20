import type { Metadata } from "next";
import { BuzzWeb } from "@/components/web/BuzzWeb";
import { webCopy } from "@/content/web";
import { getMe, getPublicTracking, listChats, listNotifications, listUpdates, type PublicParcel } from "@/lib/data";

export const metadata: Metadata = {
  title: webCopy.meta.title,
  description: webCopy.meta.description,
  robots: { index: false },
};

/**
 * Buzz Web (DESIGN.md §11): the pairing screen with a QR that refreshes and
 * expires, then the chat app. Data is loaded here through the mock data
 * layer and handed to the client app, which owns all the session state.
 */
export default async function BuzzWebPage() {
  const [me, chats, notifications, updates] = await Promise.all([
    getMe(),
    listChats(),
    listNotifications(),
    listUpdates(),
  ]);

  // Public tracking only (no rider details): every order in a chat or a notification
  const ids = new Set<string>();
  for (const c of chats) for (const m of c.messages) if (m.trackingId) ids.add(m.trackingId);
  for (const n of notifications) if (n.trackingId) ids.add(n.trackingId);
  const tracking: Record<string, PublicParcel> = {};
  await Promise.all(
    [...ids].map(async (id) => {
      const t = await getPublicTracking(id);
      if (t) tracking[id] = t;
    }),
  );

  return <BuzzWeb me={me} chats={chats} notifications={notifications} updates={updates} tracking={tracking} />;
}
