"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, Search } from "lucide-react";
import { Chip } from "@/components/Chip";
import { wizardCopy as w } from "@/content/onboarding";
import { formatDate, formatTime } from "@/lib/data/format";
import { cn } from "@/lib/cn";

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-[14px] text-alert-700">
      <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
      {text}
    </p>
  );
}

/** Pick several from a short list, as toggle chips (a fieldset of real checkboxes) */
export function MultiChips({
  legend,
  help,
  options,
  value,
  onChange,
  error,
  name,
}: {
  legend: string;
  help?: string;
  options: Array<{ value: string; label: string; body?: string }>;
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
  name: string;
}) {
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const rich = options.some((o) => o.body);
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${name}-error` : help ? `${name}-help` : undefined}>
      <legend className="mb-2 text-[14px] font-semibold text-ink-900">{legend}</legend>
      {help && (
        <p id={`${name}-help`} className="-mt-1 mb-1 text-[13px] text-ink-500">
          {help}
        </p>
      )}
      <div className={cn(rich ? "grid gap-2 sm:grid-cols-3" : "flex flex-wrap gap-2")}>
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <label
              key={o.value}
              className={cn(
                "cursor-pointer transition-colors duration-(--dur-1) ease-out",
                "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sky-400",
                rich
                  ? cn("flex items-start gap-3 rounded-field border-[1.5px] px-4 py-3", on ? "border-blue-600 bg-blue-50" : "border-line-strong bg-white hover:border-ink-500")
                  : cn("inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium", on ? "bg-ink-900 text-white" : "border border-line-strong bg-white text-ink-900 hover:border-ink-900"),
              )}
            >
              <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(o.value)} />
              {rich && (
                <span aria-hidden="true" className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-[6px] border-[1.5px]", on ? "border-blue-600 bg-blue-600 text-white" : "border-line-strong bg-white")}>
                  {on && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              )}
              {!rich && on && <Check aria-hidden="true" className="size-4" strokeWidth={2.4} />}
              <span>
                <span className={cn(rich && "block text-[15px] font-semibold text-ink-900")}>{o.label}</span>
                {o.body && <span className="block text-[13px] text-ink-700">{o.body}</span>}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError id={`${name}-error`} text={error} />
    </fieldset>
  );
}

/** Pick several from a long list (states, countries): search, then toggle chips */
export function SearchChips({
  legend,
  help,
  options,
  value,
  onChange,
  error,
  name,
}: {
  legend: string;
  help?: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
  name: string;
}) {
  const [q, setQ] = useState("");
  const shown = options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase()));
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${name}-error` : help ? `${name}-help` : undefined}>
      <legend className="mb-2 text-[14px] font-semibold text-ink-900">
        {legend}
        {value.length > 0 && <span className="ml-2 font-normal text-ink-500 tabular-nums">{value.length} picked</span>}
      </legend>
      {help && (
        <p id={`${name}-help`} className="-mt-1 mb-1 text-[13px] text-ink-500">
          {help}
        </p>
      )}
      <label className="relative block sm:w-72">
        <span className="sr-only">Filter {legend.toLowerCase()}</span>
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500" strokeWidth={1.8} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type to filter"
          className="h-11 w-full rounded-full border-[1.5px] border-line-strong bg-white pr-4 pl-10 text-[16px] text-ink-900 placeholder:text-ink-500 hover:border-ink-500 focus:outline-3 focus:outline-offset-3 focus:outline-sky-400"
        />
      </label>
      <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto py-1">
        {shown.map((o) => (
          <Chip key={o} selected={value.includes(o)} onClick={() => toggle(o)} icon={value.includes(o) ? <Check aria-hidden="true" className="size-4" strokeWidth={2.4} /> : undefined}>
            {o}
          </Chip>
        ))}
        {shown.length === 0 && <p className="text-[14px] text-ink-500">Nothing matches.</p>}
      </div>
      <FieldError id={`${name}-error`} text={error} />
    </fieldset>
  );
}

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Africa/Lagos" });
const dayNum = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "Africa/Lagos" });
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Lagos" });

/**
 * Date and time picker for a booking (DESIGN.md §10.1): available days as a
 * small calendar strip, then the free times on that day (WAT).
 */
export function SlotPicker({
  slots,
  value,
  onChange,
  error,
  label,
}: {
  slots: string[];
  value: string | null;
  onChange: (slot: string) => void;
  error?: string;
  label: string;
}) {
  const days = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const s of slots) (m.get(s.slice(0, 10)) ?? m.set(s.slice(0, 10), []).get(s.slice(0, 10))!).push(s);
    return [...m.entries()];
  }, [slots]);
  const [day, setDay] = useState<string | null>(value ? value.slice(0, 10) : (days[0]?.[0] ?? null));
  const times = days.find(([d]) => d === day)?.[1] ?? [];

  return (
    <div className="flex flex-col gap-4" aria-describedby={error ? "slot-error" : undefined}>
      <fieldset>
        <legend className="mb-1 text-[14px] font-semibold text-ink-900">{w.pickDay}</legend>
        <p className="mb-3 text-[13px] text-ink-500">{day ? monthName.format(new Date(`${day}T12:00:00+01:00`)) : ""}</p>
        <div className="grid grid-cols-5 gap-2">
          {days.map(([d]) => {
            const on = d === day;
            const date = new Date(`${d}T12:00:00+01:00`);
            return (
              <label
                key={d}
                className={cn(
                  "flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-field border-[1.5px] text-center",
                  "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sky-400",
                  on ? "border-blue-600 bg-blue-50 text-blue-700" : "border-line-strong bg-white text-ink-900 hover:border-ink-500",
                )}
              >
                <input type="radio" name={`${label}-day`} className="sr-only" checked={on} onChange={() => setDay(d)} aria-label={formatDate(`${d}T12:00:00+01:00`)} />
                <span className="text-[12px] font-medium text-ink-500" aria-hidden="true">
                  {weekday.format(date)}
                </span>
                <span className="text-[18px] font-semibold tabular-nums" aria-hidden="true">
                  {dayNum.format(date)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-[14px] font-semibold text-ink-900">{w.pickTime}</legend>
        {times.length === 0 ? (
          <p className="text-[14px] text-ink-500">{w.noSlots}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {times.map((t) => (
              <Chip key={t} selected={value === t} onClick={() => onChange(t)}>
                <span className="tabular-nums">{formatTime(t)}</span>
              </Chip>
            ))}
          </div>
        )}
        <p className="mt-3 text-[13px] text-ink-500">{w.timezone}</p>
      </fieldset>
      {error && (
        <p id="slot-error" className="flex items-start gap-1.5 text-[14px] text-alert-700">
          <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
          {error}
        </p>
      )}
    </div>
  );
}
