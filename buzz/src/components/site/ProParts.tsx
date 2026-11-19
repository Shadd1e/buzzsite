"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BadgeCheck, CalendarCheck, Home, Play, ShoppingBag, Wrench } from "lucide-react";
import { Chip } from "@/components/Chip";
import { StatusPill } from "@/components/StatusPill";
import { Avatar } from "@/components/chat";
import { formatNaira } from "@/lib/data/format";
import type { ParcelStatus } from "@/lib/data/types";
import { cn } from "@/lib/cn";

/* ---------- Hero: Pro ID card (§9.3) ---------- */

export function ProIdCard({
  name,
  profession,
  area,
  proId,
  note,
}: {
  name: string;
  profession: string;
  area: string;
  proId: string;
  note: string;
}) {
  return (
    <article aria-label={`Pro ID card: ${name}`} className="rounded-panel bg-navy-800 p-6 text-white ring-1 ring-navy-700">
      <div className="flex items-center gap-4">
        <Avatar sender={{ name }} size="xl" decorative />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[19px] font-semibold">
            {name}
            <BadgeCheck aria-label="Pro" className="size-5 text-sky-400" strokeWidth={1.8} />
          </p>
          <p className="text-[15px] text-ink-300">
            {profession}, {area}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-navy-700 pt-4">
        <p className="code-text text-[16px]">{proId}</p>
        <p className="text-[12px] text-ink-300">{note}</p>
      </div>
    </article>
  );
}

/** Booking content for a chat bubble */
export function BookingSlip({ when }: { when: string }) {
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-tile bg-blue-50 text-blue-600">
        <CalendarCheck className="size-5" strokeWidth={1.8} />
      </span>
      <span>
        <span className="block text-[13px] text-ink-500">Booking</span>
        <span className="block font-semibold">{when}</span>
      </span>
    </span>
  );
}

/* ---------- Profession switcher (§9.3 moment) ---------- */

export interface Profession {
  id: string;
  name: string;
  line: string;
  tools: readonly string[];
  example: { kind: "product" | "home" | "proid" | "service" | "video"; title: string; meta: string };
}

/** A small example of what this trade would show customers (illustrative). */
function Example({ e }: { e: Profession["example"] }) {
  const Icon = { product: ShoppingBag, home: Home, proid: BadgeCheck, service: Wrench, video: Play }[e.kind];
  if (e.kind === "video") {
    return (
      <div className="flex aspect-[9/12] w-[150px] flex-col justify-end rounded-card bg-navy p-3">
        <span aria-hidden="true" className="mb-auto grid flex-1 place-items-center text-white/80">
          <Play className="size-8 fill-current" strokeWidth={0} />
        </span>
        <p className="text-[13px] font-semibold text-white">{e.title}</p>
        <span className="mt-2 rounded-full bg-sky-400 py-1.5 text-center text-[12px] font-semibold text-ink-900">{e.meta}</span>
      </div>
    );
  }
  return (
    <div className="w-[190px] rounded-card bg-white p-3 ring-1 ring-line">
      <span aria-hidden="true" className="grid aspect-[4/3] place-items-center rounded-tile bg-blue-50 text-blue-600">
        <Icon className="size-7" strokeWidth={1.5} />
      </span>
      <p className={cn("mt-2 text-[14px] font-semibold text-ink-900", e.kind === "proid" && "code-text")}>{e.title}</p>
      <p className="text-[13px] tabular-nums text-ink-500">{e.meta}</p>
    </div>
  );
}

export function ProfessionSwitcher({
  professions,
  toolNames,
  toolLines,
  placeholder,
}: {
  professions: readonly Profession[];
  toolNames: Record<string, string>;
  toolLines: Record<string, string>;
  placeholder: string;
}) {
  const [id, setId] = useState(professions[0].id);
  const reduce = useReducedMotion();
  const current = professions.find((p) => p.id === id) ?? professions[0];

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Choose a profession" className="flex flex-wrap gap-2">
        {professions.map((p) => (
          <Chip key={p.id} selected={p.id === id} onClick={() => setId(p.id)}>
            {p.name}
          </Chip>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing tools for {current.name}
      </p>

      <div className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.article
            key={current.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-8 rounded-panel bg-mist p-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-12 md:p-10"
          >
            <div className="flex justify-center md:justify-start">
              <Example e={current.example} />
            </div>
            <div>
              <h3 className="text-h3">{current.name}</h3>
              <p className="mt-2 max-w-[32em] text-body text-ink-700">{current.line}</p>
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {current.tools.map((t) => (
                  <li key={t} className="py-3">
                    <p className="text-[15px] font-semibold text-ink-900">{toolNames[t]}</p>
                    <p className="text-[14px] text-ink-700">{toolLines[t]}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] text-ink-500">{placeholder}</p>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Three product cards (§9.3), each with a vignette ---------- */

function ProductCard({ title, body, children, className }: { title: string; body: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={cn("flex flex-col gap-8 rounded-panel bg-mist p-6 md:p-8", className)}>
      <div className="flex-1">{children}</div>
      <div>
        <h3 className="text-h3">{title}</h3>
        <p className="mt-2 text-[16px] leading-relaxed text-ink-700 lg:min-h-[5.1em]">{body}</p>
      </div>
    </article>
  );
}

export function ProProducts({
  storefront,
  businessCentre,
  showcase,
  orders,
}: {
  storefront: { title: string; body: string; items: ReadonlyArray<{ name: string; price: number }> };
  businessCentre: { title: string; body: string };
  showcase: { title: string; body: string };
  orders: Array<{ id: string; item: string; status: ParcelStatus }>;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
      <ProductCard title={storefront.title} body={storefront.body}>
        <ul className="grid grid-cols-2 gap-2" aria-label="Sample Storefront items">
          {storefront.items.map((it) => (
            <li key={it.name} className="rounded-field bg-white p-3">
              <span aria-hidden="true" className="mb-2 grid aspect-[4/3] place-items-center rounded-tile bg-blue-50 text-blue-600">
                <ShoppingBag className="size-5" strokeWidth={1.6} />
              </span>
              <p className="truncate text-[13px] font-medium text-ink-900">{it.name}</p>
              <p className="text-[13px] tabular-nums text-ink-700">{formatNaira(it.price)}</p>
            </li>
          ))}
        </ul>
      </ProductCard>

      <ProductCard title={businessCentre.title} body={businessCentre.body}>
        <ul className="divide-y divide-line rounded-field bg-white" aria-label="Sample orders">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-ink-900">{o.item}</p>
                <p className="code-text text-[12px] text-ink-500">{o.id}</p>
              </div>
              <StatusPill status={o.status} size="sm" />
            </li>
          ))}
        </ul>
      </ProductCard>

      <ProductCard title={showcase.title} body={showcase.body}>
        <div className="relative mx-auto flex aspect-[9/14] w-[min(100%,210px)] flex-col justify-end overflow-hidden rounded-card bg-navy p-4">
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full bg-white/15 text-white">
              <Play className="size-6 translate-x-0.5 fill-current" strokeWidth={0} />
            </span>
          </span>
          <p className="relative text-[13px] text-ink-300">[Video placeholder]</p>
          <p className="relative mt-1 text-[14px] font-semibold text-white">Adire scarf</p>
          <span className="relative mt-3 inline-flex h-10 items-center justify-center rounded-full bg-sky-400 text-[14px] font-semibold text-ink-900">
            Shop now
          </span>
        </div>
      </ProductCard>
    </div>
  );
}
