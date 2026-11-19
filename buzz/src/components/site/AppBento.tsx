"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Laptop, Lock, ShieldAlert } from "lucide-react";
import { Avatar } from "@/components/chat";
import { cn } from "@/lib/cn";

/**
 * The App bento (DESIGN.md §9.2). Cards are allowed here because each one is
 * a distinct product with its own small live UI (§8.2): 28px panels, no
 * shadow, varied spans.
 */
type Item = { title: string; body: string };

function Card({
  title,
  body,
  className,
  children,
  footer,
}: Item & { className?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <article className={cn("flex flex-col justify-between gap-8 rounded-panel bg-mist p-6 md:p-8", className)}>
      <div className="min-h-[120px]">{children}</div>
      <div>
        <h3 className="text-h3">{title}</h3>
        <p className="mt-2 max-w-[28em] text-[16px] leading-relaxed text-ink-700">{body}</p>
        {footer}
      </div>
    </article>
  );
}

export function AppBento({
  items,
  groupMembers,
  groupName,
}: {
  items: { groups: Item; status: Item; stickers: Item; encryption: Item; web: Item & { link: { label: string; href: string } } };
  groupMembers: string[];
  groupName: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card {...items.groups} className="lg:col-span-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex -space-x-3" aria-hidden="true">
            {groupMembers.map((m) => (
              <span key={m} className="rounded-full ring-4 ring-mist">
                <Avatar sender={{ name: m }} size="xl" decorative />
              </span>
            ))}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-ink-900">{groupName}</p>
            <p className="text-[13px] text-ink-500">[members] members</p>
          </div>
        </div>
      </Card>

      <Card {...items.status}>
        <div className="flex items-center gap-3" aria-hidden="true">
          {["Tobi", "Kemi"].map((p) => (
            <span key={p} className="rounded-full p-[3px] ring-[2.5px] ring-blue-600">
              <Avatar sender={{ name: p }} size="xl" decorative />
            </span>
          ))}
          <span className="grid size-[62px] place-items-center rounded-full ring-[2.5px] ring-alert-600 ring-offset-[3px] ring-offset-mist">
            <span className="grid size-14 place-items-center rounded-full bg-alert-600 text-white">
              <ShieldAlert className="size-6" strokeWidth={1.8} />
            </span>
          </span>
        </div>
      </Card>

      <Card {...items.stickers}>
        <ul className="grid grid-cols-3 gap-2" aria-label="Sticker placeholders">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="grid aspect-square place-items-center rounded-card border-[1.5px] border-dashed border-line-strong text-[12px] text-ink-500"
            >
              [sticker]
            </li>
          ))}
        </ul>
      </Card>

      <Card {...items.encryption}>
        <span aria-hidden="true" className="grid size-16 place-items-center rounded-card bg-blue-600 text-white">
          <Lock className="size-7" strokeWidth={1.8} />
        </span>
      </Card>

      <Card
        {...items.web}
        className="md:col-span-2 lg:col-span-1"
        footer={
          <Link
            href={items.web.link.href}
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
          >
            {items.web.link.label}
            <span aria-hidden="true">↗</span>
          </Link>
        }
      >
        <div className="flex items-end gap-4" aria-hidden="true">
          <Laptop className="size-20 text-ink-700" strokeWidth={1.2} />
          <span className="rounded-card bg-white p-2">
            <QRCodeSVG value="buzz-web:pairing:sample" size={72} level="L" fgColor="currentColor" className="text-ink-900" />
          </span>
        </div>
      </Card>
    </div>
  );
}
