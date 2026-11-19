import { NotificationBanner } from "@/components/NotificationBanner";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Avatar, Bubble } from "@/components/chat";
import type { MessageStatus } from "@/lib/data/types";

/**
 * Phone mockup for the homepage safety row (DESIGN.md §9.1): an estate group
 * chat where an EMBA security update drops in from the top and loops.
 * Real Buzz UI in HTML, no status bar.
 */
export function EstatePhone({
  group,
  members,
  alert,
  messages,
}: {
  group: string;
  members: string;
  alert: { title: string; body: string; area: string; time: string };
  messages: ReadonlyArray<{ from: string; text: string; time: string; status?: MessageStatus }>;
}) {
  return (
    <PhoneFrame label={`${group} chat, with a security update arriving`}>
      <div className="flex items-center gap-3 border-b border-line px-4 pt-5 pb-3">
        <Avatar sender={{ name: "Estate Residents" }} size="lg" decorative />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-ink-900">{group}</p>
          <p className="truncate text-[12px] text-ink-500">{members}</p>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col justify-end gap-2 bg-blue-50 px-3 py-4">
        <div className="alert-drop absolute inset-x-3 top-3 z-10">
          <NotificationBanner tone="security" title={alert.title} body={alert.body} />
        </div>
        {messages.map((m, i) =>
          m.from === "me" ? (
            <Bubble key={i} variant="out" time={m.time} status={m.status}>
              {m.text}
            </Bubble>
          ) : (
            <Bubble key={i} variant="in" sender={{ name: m.from }} showName onTint time={m.time}>
              {m.text}
            </Bubble>
          ),
        )}
      </div>
    </PhoneFrame>
  );
}
