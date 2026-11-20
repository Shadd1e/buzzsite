import Link from "next/link";
import type { ReactNode } from "react";
import { Clock, EyeOff, KeyRound, Layers, MapPin, ShieldCheck } from "lucide-react";
import { Bubble } from "@/components/chat";
import { Code } from "@/components/Code";
import { StatusPill } from "@/components/StatusPill";
import { logisticsTrack } from "@/content/logistics";
import { formatDateTime, formatDayTime, formatNaira } from "@/lib/data/format";
import type { ParcelStatus, PublicParcel } from "@/lib/data/types";
import { cn } from "@/lib/cn";

/**
 * Track result (DESIGN.md §10.1): header (status pill, tracking ID with copy,
 * partner, delivery type), a note for the current state, the timeline of
 * system bubbles (newest first, "Batch scan" tag), a city-level route and
 * the context actions. Public view only: the data layer has already removed
 * riders, receivers and codes.
 */
const copy = logisticsTrack.result;

/** The reason after "…: " in labels like "Delivery attempt 1 failed: receiver not home" */
function reasonOf(label?: string): string | null {
  const r = label?.split(": ")[1];
  return r ? r.charAt(0).toUpperCase() + r.slice(1) : null;
}

function headline(p: PublicParcel): string {
  const city = p.lastScan?.city ?? "";
  const storageEnding = p.storage && p.storage.dayNumber >= p.storage.freeDays;
  switch (p.status) {
    case "booked":
      return "Booked. Waiting for the partner to collect it";
    case "picked_up":
      return `Picked up in ${city}`;
    case "in_transit":
      return `On its way. Last scanned in ${city}`;
    case "at_pickup_point":
    case "storage_expiring":
      return storageEnding ? `Last free day to collect in ${city}` : `Ready to collect in ${city}`;
    case "out_for_delivery":
      return `Out for delivery in ${city}`;
    case "delivered":
      return `Delivered in ${city}`;
    case "failed_attempt":
      return `Delivery attempt ${p.attempts ?? 1} didn't work`;
    case "returned":
      return "Returned to the seller";
    case "refused":
      return "Refused at delivery. Going back to the seller";
    case "disputed":
      return "A dispute is open on this order";
  }
}

type Tone = "blue" | "warn" | "ok" | "alert" | "ink";
const toneClass: Record<Tone, string> = {
  blue: "bg-blue-50",
  warn: "bg-warn-50",
  ok: "bg-ok-50",
  alert: "bg-alert-50",
  ink: "bg-mist",
};

function StateNote({ tone, title, children }: { tone: Tone; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="state-title" className={cn("rounded-panel p-6 md:p-8", toneClass[tone])}>
      <h2 id="state-title" className="text-h3">
        {title}
      </h2>
      <div className="mt-2 max-w-[40em] space-y-3 text-body text-ink-700">{children}</div>
    </section>
  );
}

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5">
      <span aria-hidden="true" className="mt-1 shrink-0 text-ink-900">
        {icon}
      </span>
      <span>{children}</span>
    </p>
  );
}

const ic = "size-[18px]";

function stateNote(p: PublicParcel): ReactNode {
  const latest = p.timeline[0];
  switch (p.status) {
    case "booked":
      return (
        <StateNote tone="ink" title="The seller is getting it ready">
          <p>{p.partnerName} will scan it when they collect it from the seller. You&apos;ll see each scan here.</p>
        </StateNote>
      );
    case "picked_up":
    case "in_transit":
      return (
        <StateNote tone="blue" title="On its way">
          <p>
            {p.partnerName} scans it at each stop. It&apos;s heading to {p.route.at(-1)}.
          </p>
        </StateNote>
      );
    case "out_for_delivery":
      return (
        <StateNote tone="blue" title="Have your delivery code ready">
          <Fact icon={<KeyRound className={ic} strokeWidth={1.8} />}>
            The rider needs your 4-digit delivery code to hand it over. You&apos;ll find it in the Buzz app, under your
            Depot order.
          </Fact>
        </StateNote>
      );
    case "at_pickup_point":
    case "storage_expiring": {
      const s = p.storage;
      const pp = p.pickupPoint;
      const ending = s && s.dayNumber >= s.freeDays;
      return (
        <StateNote tone="warn" title={ending ? "Collect it today to avoid a fee" : "Ready to collect"}>
          <Fact icon={<MapPin className={ic} strokeWidth={1.8} />}>
            {pp ? (
              <>
                <strong className="font-semibold text-ink-900">{pp.name}</strong>
                <br />
                {pp.address}
                <br />
                {pp.hours}
              </>
            ) : (
              <>
                <strong className="font-semibold text-ink-900">Pickup point in {p.lastScan?.city}</strong>
                <br />
                The address and opening hours are in your Buzz app, under your Depot order.
              </>
            )}
          </Fact>
          {s && (
            <Fact icon={<Clock className={ic} strokeWidth={1.8} />}>
              Day {s.dayNumber} of {s.freeDays} free days.{" "}
              {ending ? "From tomorrow" : `After day ${s.freeDays}`}, {p.partnerName} charges {formatNaira(s.feeAfter)} a
              day. If it isn&apos;t collected within {s.returnAfterDays} days, it goes back to the seller.
            </Fact>
          )}
          <Fact icon={<KeyRound className={ic} strokeWidth={1.8} />}>
            Bring your pickup code from the Buzz app and an ID. Sending someone else? Add their name in the app to get
            a new one-time code for them.
          </Fact>
        </StateNote>
      );
    }
    case "delivered":
      return (
        <StateNote tone="ok" title="Proof of delivery">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {p.proof?.photo && (
              <figure className="m-0 shrink-0">
                <div
                  role="img"
                  aria-label="Proof of delivery photo, blurred for privacy"
                  className="relative grid size-28 place-items-center overflow-hidden rounded-card bg-[linear-gradient(135deg,var(--color-ink-300),var(--color-line),var(--color-ink-500))]"
                >
                  <span aria-hidden="true" className="absolute inset-0 backdrop-blur-md" />
                  <EyeOff aria-hidden="true" className="relative size-6 text-white" strokeWidth={1.8} />
                </div>
                <figcaption className="mt-2 max-w-28 text-small text-ink-700">Proof photo, blurred for privacy</figcaption>
              </figure>
            )}
            <div className="space-y-3">
              {p.proof?.deliveryCodeVerified && (
                <Fact icon={<ShieldCheck className={ic} strokeWidth={1.8} />}>Confirmed by delivery code.</Fact>
              )}
              <p>
                Confirm it arrived in the Buzz app so SunPay pays the seller. If you don&apos;t confirm or open a dispute,
                the payment is released after 5 days.
              </p>
            </div>
          </div>
        </StateNote>
      );
    case "failed_attempt":
      return (
        <StateNote tone="warn" title={`Attempt ${p.attempts ?? 1} of 2 didn't work`}>
          {reasonOf(latest?.label) && <p>Reason: {reasonOf(latest?.label)}.</p>}
          <p>
            In the Buzz app you can reschedule, change the address or switch to pickup. After 2 attempts, the parcel goes
            to the nearest pickup point.
          </p>
        </StateNote>
      );
    case "returned":
      return (
        <StateNote tone="ink" title="Returned to the seller">
          {latest?.label && <p>{latest.label}.</p>}
          <p>For questions about your order, contact customer care in the Buzz app.</p>
        </StateNote>
      );
    case "refused":
      return (
        <StateNote tone="ink" title="Going back to the seller">
          <p>The parcel was refused at delivery, and the partner recorded a photo and a reason.</p>
          <p>
            If you didn&apos;t refuse it, open a dispute in the Buzz app within 5 days. Otherwise you&apos;re refunded,
            minus the delivery cost.
          </p>
        </StateNote>
      );
    case "disputed":
      return (
        <StateNote tone="alert" title="A dispute is open">
          {reasonOf(latest?.label) && <p>Reason: {reasonOf(latest?.label)}.</p>}
          <p>SunPay holds the payment until Buzz reviews the case. You can follow it in the Buzz app.</p>
        </StateNote>
      );
  }
}

/**
 * Scanned cities in order. While it's still moving, the destination is shown
 * ahead (greyed). Once it has arrived anywhere, nothing is shown ahead.
 */
const moving: ParcelStatus[] = ["booked", "picked_up", "in_transit"];

function routeStops(p: PublicParcel) {
  const visited: string[] = [];
  for (const t of [...p.timeline].reverse()) if (!visited.includes(t.city)) visited.push(t.city);
  const destination = p.route.at(-1);
  const ahead = moving.includes(p.status) && destination && !visited.includes(destination) ? [destination] : [];
  return [
    ...visited.map((city, i) => ({ city, state: i === visited.length - 1 ? ("latest" as const) : ("done" as const) })),
    ...ahead.map((city) => ({ city, state: "ahead" as const })),
  ];
}

const finalStatuses: ParcelStatus[] = ["delivered", "returned", "refused", "disputed"];

export function TrackResult({ parcel: p }: { parcel: PublicParcel }) {
  const stops = routeStops(p);
  const showChoices = !finalStatuses.includes(p.status);

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      {/* Header */}
      <header className="flex flex-col gap-6">
        <StatusPill status={p.status} className="self-start" />
        <h1 className="max-w-[18em] text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-light tracking-[-0.03em]">
          {headline(p)}
        </h1>
        <dl className="grid gap-x-10 gap-y-5 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[14px] text-ink-500">{copy.labels.trackingId}</dt>
            <dd className="mt-1.5">
              <Code value={p.trackingId} label={copy.labels.trackingId} />
            </dd>
          </div>
          <div>
            <dt className="text-[14px] text-ink-500">{copy.labels.partner}</dt>
            <dd className="mt-1.5 text-[17px] font-medium text-ink-900">{p.partnerName}</dd>
          </div>
          <div>
            <dt className="text-[14px] text-ink-500">{copy.labels.type}</dt>
            <dd className="mt-1.5 text-[17px] font-medium text-ink-900">{copy.deliveryType[p.deliveryType]}</dd>
          </div>
          {p.lastScan && (
            <div>
              <dt className="text-[14px] text-ink-500">{copy.labels.lastScan}</dt>
              <dd className="mt-1.5 text-[17px] font-medium text-ink-900">
                {p.lastScan.city}
                <span className="block text-[14px] font-normal text-ink-500 tabular-nums">
                  {formatDateTime(p.lastScan.at)}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {stateNote(p)}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        {/* Timeline: system bubbles, newest first */}
        <section aria-labelledby="timeline-title">
          <h2 id="timeline-title" className="text-h3">
            {copy.timelineTitle}
          </h2>
          <ol className="mt-5 flex flex-col gap-3 rounded-convo bg-blue-50 p-4 sm:p-6">
            {p.timeline.map((t, i) => (
              <li key={`${t.at}-${i}`}>
                <Bubble variant="system" time={formatDayTime(t.at)}>
                  <span className="block">{t.label}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[14px] text-ink-500">
                    {t.city}
                    {t.viaBatch && (
                      <span
                        title={copy.batchHelp}
                        className="inline-flex h-6 items-center gap-1 rounded-tag bg-blue-50 px-2 text-[12px] font-medium text-blue-700"
                      >
                        <Layers aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                        {copy.batchTag}
                        <span className="sr-only">: {copy.batchHelp}</span>
                      </span>
                    )}
                  </span>
                </Bubble>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-12">
          {/* City-level route: scan points only */}
          <section aria-labelledby="route-title">
            <h2 id="route-title" className="text-h3">
              {copy.routeTitle}
            </h2>
            <ol className="relative mt-5 flex flex-col gap-5">
              <span aria-hidden="true" className="absolute top-2 bottom-2 left-[8px] w-0.5 bg-line-strong" />
              {stops.map((s) => (
                <li key={s.city} className="relative flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative size-[18px] shrink-0 rounded-full border-[3px]",
                      s.state === "ahead" ? "border-line-strong bg-white" : "border-blue-600 bg-blue-600",
                      s.state === "latest" && "ring-4 ring-blue-600/20",
                    )}
                  />
                  <span className={cn("text-[16px]", s.state === "ahead" ? "text-ink-500" : "font-medium text-ink-900")}>
                    {s.city}
                    <span className="sr-only">
                      {s.state === "ahead" ? " (not reached yet)" : s.state === "latest" ? " (latest scan)" : " (scanned)"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-small text-ink-500">{copy.routeCaption}</p>
          </section>

          <section aria-labelledby="actions-title">
            <h2 id="actions-title" className="text-h3">
              {copy.actionsTitle}
            </h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {showChoices && (
                <>
                  <li className="py-4">
                    <h3 className="text-[17px] font-semibold text-ink-900">{copy.actions.choose.title}</h3>
                    <p className="mt-1 text-[16px] text-ink-700">{copy.actions.choose.body}</p>
                  </li>
                  <li className="py-4">
                    <h3 className="text-[17px] font-semibold text-ink-900">{copy.actions.someone.title}</h3>
                    <p className="mt-1 text-[16px] text-ink-700">{copy.actions.someone.body}</p>
                  </li>
                </>
              )}
              <li className="py-4">
                <h3 className="text-[17px] font-semibold text-ink-900">{copy.actions.help.title}</h3>
                <p className="mt-1 text-[16px] text-ink-700">{copy.actions.help.body}</p>
                <Link
                  href={copy.actions.help.link.href}
                  className="mt-1 inline-flex min-h-11 items-center text-[16px] font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
                >
                  {copy.actions.help.link.label}
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
