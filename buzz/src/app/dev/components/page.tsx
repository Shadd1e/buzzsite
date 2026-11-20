import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ChevronDown, MapPin, Paperclip, Plus, Users, Briefcase } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox, Switch } from "@/components/Checkbox";
import { Chip } from "@/components/Chip";
import { Code } from "@/components/Code";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { Nav } from "@/components/Nav";
import { NotificationBanner } from "@/components/NotificationBanner";
import { OrderCard } from "@/components/OrderCard";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Select } from "@/components/Select";
import { Skeleton } from "@/components/Skeleton";
import { StatusPill } from "@/components/StatusPill";
import { StepProgress } from "@/components/StepProgress";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { ToastPreview } from "@/components/Toast";
import { UploadSlot } from "@/components/UploadSlot";
import { Avatar, Bubble, Typing, VoiceNote, type ConvoMessage, type Sender } from "@/components/chat";
import {
  formatDateTime,
  formatNaira,
  formatTime,
  getChat,
  getDispute,
  getParcel,
  getPartnerByCompanyCode,
  getPublicTracking,
  listParcels,
  listRiders,
  type ParcelStatus,
} from "@/lib/data";
import { cn } from "@/lib/cn";
import { ChipDemo, ConfirmDemo, ConvoReplay, Swatch, TableDemo, TabsDemo, ToastDemo, UploadDemo } from "./demos";
import { DevRail, type RailGroup } from "./rail";

export const metadata: Metadata = {
  title: "Components",
  robots: { index: false, follow: false },
};

/* ---------- page structure ---------- */

const groups: RailGroup[] = [
  {
    id: "foundations",
    label: "Foundations",
    items: [
      { id: "tokens", label: "Tokens" },
      { id: "logo", label: "Logo" },
      { id: "aurora", label: "Live gradient" },
    ],
  },
  {
    id: "controls",
    label: "Controls",
    items: [
      { id: "buttons", label: "Buttons" },
      { id: "states", label: "Interaction states" },
      { id: "chips", label: "Chips" },
      { id: "fields", label: "Inputs and fields" },
      { id: "choices", label: "Select, checkbox, switch" },
      { id: "codes", label: "Codes" },
      { id: "upload", label: "Upload slot" },
    ],
  },
  {
    id: "data",
    label: "Data and feedback",
    items: [
      { id: "table", label: "Table and drawer" },
      { id: "tabs", label: "Tabs" },
      { id: "steps", label: "Step progress" },
      { id: "status", label: "Status pills" },
      { id: "dialogs", label: "Confirm dialog" },
      { id: "toasts", label: "Toasts" },
      { id: "banners", label: "Banners" },
      { id: "empty", label: "Empty and loading" },
      { id: "ribbon", label: "Test data ribbon" },
    ],
  },
  {
    id: "chat",
    label: "Chat",
    items: [
      { id: "bubbles", label: "Bubbles" },
      { id: "dark", label: "Dark theme" },
      { id: "order", label: "Order card" },
      { id: "convo", label: "Convo" },
      { id: "phone", label: "Phone frame" },
    ],
  },
  {
    id: "chrome",
    label: "Site chrome",
    items: [
      { id: "nav", label: "Nav" },
      { id: "footer", label: "Footer" },
    ],
  },
];

/** Not built yet: listed so nobody invents an off-spec version. */
const notBuilt: Array<[string, string, string]> = [
  ["Date and time picker", "§10.1", "Book your meeting"],
  ["QR code and camera scanner", "§10.1", "Public site (`/logistics`, brand register, lighter) (§10.1)"],
  ["City route map (SVG)", "§10.1", "Public site (`/logistics`, brand register, lighter) (§10.1)"],
  ["Overview stat tiles and charts", "§10.2", "Partner portal (`/logistics/portal`, product register) (§10.2)"],
  ["Thermal label preview", "§10.2", "Partner portal (`/logistics/portal`, product register) (§10.2)"],
  ["Applications pipeline board", "§10.3", "Buzz admin console (`/admin`, internal, product register) (§10.3)"],
  ["Dispute countdown", "§10.3", "Buzz admin console (`/admin`, internal, product register) (§10.3)"],
  ["Accordion and breadcrumb", "§9.11", "Help Centre `/help` (§9.11)"],
  ["Legal draft banner and table of contents", "§9.12", "Legal (8 pages, one template) (§9.12)"],
  ["Profession switcher", "§9.3", "Buzz Pro `/pro` (navy hero, the only dark marketing hero) (§9.3)"],
];

/** Link to a DESIGN.md heading via a text fragment on /dev/design. */
function specHref(heading: string) {
  return `/dev/design#:~:text=${encodeURIComponent(heading).replace(/-/g, "%2D")}`;
}

const statusGroups: Array<[string, ParcelStatus[]]> = [
  ["Moving", ["booked", "picked_up", "in_transit", "out_for_delivery"]],
  ["Needs attention", ["at_pickup_point", "failed_attempt", "storage_expiring", "disputed"]],
  ["Finished", ["delivered", "returned", "refused"]],
];

/* ---------- layout helpers (dev page only) ---------- */

function Group({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 pt-16 first:pt-4 lg:scroll-mt-6">
      <h2 id={`${id}-title`} className="text-[clamp(30px,3vw,40px)] leading-[1.1] font-light tracking-[-0.03em]">
        {title}
      </h2>
      <p className="mt-3 max-w-[40em] text-ui text-ink-500">{intro}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Section({
  id,
  title,
  spec,
  heading,
  imports,
  children,
}: {
  id: string;
  title: string;
  /** "§8.1" */
  spec: string;
  /** The exact DESIGN.md heading, for the link */
  heading: string;
  /** import line shown under the title */
  imports?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-line py-12 lg:scroll-mt-6">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h3 id={`${id}-title`} className="text-h3">
            {title}
          </h3>
          {imports && <p className="mt-1.5 font-mono text-[12px] break-words text-ink-500">{imports}</p>}
        </div>
        <a
          href={specHref(heading)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1 text-[13px] font-medium text-blue-600 underline-offset-4 hover:underline"
        >
          DESIGN.md {spec}
          <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens the spec in a new tab)</span>
        </a>
      </div>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  );
}

function Row({
  label,
  note,
  children,
  className,
  stack,
}: {
  label: string;
  note?: string;
  children: ReactNode;
  className?: string;
  /** Label above the specimen, for wide things like tables */
  stack?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-4", !stack && "xl:grid-cols-[180px_minmax(0,1fr)] xl:gap-8")}>
      <div>
        <h4 className="text-[14px] font-semibold text-ink-900">{label}</h4>
        {note && <p className="mt-1 max-w-[36em] text-[13px] leading-normal text-ink-500">{note}</p>}
      </div>
      <div className={className ?? "flex flex-wrap items-start gap-x-4 gap-y-5"}>{children}</div>
    </div>
  );
}

/** A specimen with the exact code that renders it. */
function Spec({ code, children, className }: { code: string; children: ReactNode; className?: string }) {
  return (
    <figure className={cn("flex min-w-0 flex-col items-start gap-2", className)}>
      {children}
      <figcaption className="max-w-full font-mono text-[11.5px] leading-snug break-words text-ink-500">{code}</figcaption>
    </figure>
  );
}

/** Collapsed token block (native <details>, keyboard and screen-reader friendly). */
function Disclosure({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <details className="group border-b border-line last:border-b-0">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-semibold text-ink-900">
          {title} <span className="ml-1 font-normal text-ink-500">{meta}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 text-ink-500 transition-transform duration-(--dur-2) ease-out group-open:rotate-180"
          strokeWidth={1.8}
        />
      </summary>
      <div className="pt-2 pb-8">{children}</div>
    </details>
  );
}

/* ---------- page ---------- */

export default async function ComponentsPage() {
  // Real fixtures through the mock data layer, never imported directly.
  const [parcel, partner, riders, allRiders, chat, dispute, parcels, tracking] = await Promise.all([
    getParcel("BZT-N293-RKAG"),
    getPartnerByCompanyCode("BZL-C-1042"),
    listRiders("BZL-C-1042", { status: "active" }),
    listRiders("BZL-C-1042"),
    getChat("c1"),
    getDispute("DSP-3068"),
    listParcels({ partnerId: "BZL-C-1042" }),
    getPublicTracking("BZT-V7WE-A7GE"),
  ]);

  const adaeze: Sender = { name: "Adaeze Okeke", src: "/images/avatar-chat-sample.png" };
  const tobi: Sender = { name: "Tobi" };
  const mum: Sender = { name: chat?.name ?? "Mum" };
  const sunpay: Sender = { name: "SunPay", system: "sunpay" };
  const emba: Sender = { name: "EMBA alert", system: "emba" };
  const buzzLogistics: Sender = { name: "Buzz Logistics", system: "buzz" };

  const landedConvo: ConvoMessage[] = [
    { variant: "in", sender: tobi, content: "Mum, I've landed in Abuja", time: "12:27" },
    { variant: "out", content: "Thank God! How was the flight?", time: "12:28", status: "read" },
    { variant: "in", sender: tobi, content: <VoiceNote duration="0:21" />, time: "12:29" },
    { variant: "in", sender: tobi, typingFirst: true, content: "Driver don come. I go call you when I reach", time: "12:30" },
  ];

  const role = { buyer: "buyer", seller: "seller", system: "" } as const;
  const disputeConvo: ConvoMessage[] =
    dispute?.evidence.chat.map(
      (m): ConvoMessage => ({
        variant: m.from === "system" ? "system" : "in",
        sender: m.from === "system" ? sunpay : { name: `${m.name} (${role[m.from]})` },
        showName: true,
        time: formatTime(m.at),
        content: m.text,
      }),
    ) ?? [];

  return (
    <>
      <div id="top" className="container-page lg:grid lg:grid-cols-[208px_minmax(0,1fr)] lg:gap-12 xl:gap-14">
        <aside className="max-lg:contents lg:pt-16">
          <DevRail groups={groups} />
        </aside>

        <main className="min-w-0 pt-8 pb-24 lg:pt-16">
          <header className="max-w-[44em] pb-6">
            <h1 className="text-h1">Components</h1>
            <p className="mt-5 text-lede text-ink-700">
              The shared components built so far, each in its main states, with the code that renders it. Check a
              change here before it reaches a real page.
            </p>
            <p className="mt-3 text-ui text-ink-500">
              Some components aren&apos;t built yet. They&apos;re{" "}
              <a href="#not-built" className="font-medium text-blue-600 underline underline-offset-4">
                listed at the end
              </a>{" "}
              with the DESIGN.md section that specifies each one, so nobody invents their own.
            </p>
          </header>

          {/* ============================================================ */}
          <Group id="foundations" title="Foundations" intro="Tokens from globals.css, the placeholder logo and the live gradient.">
            <Section id="tokens" title="Tokens" spec="§2–§6" heading="Color (§2)" imports="globals.css @theme: bg-blue-600, text-h1, rounded-panel, shadow-float, ease-out, duration-(--dur-2)">
              <div className="rounded-field border border-line px-5">
                <Disclosure title="Colour" meta="38 tokens">
                  <div className="flex flex-col gap-8">
                    <Row label="Brand blues" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      <Swatch token="--color-blue-600" role="Primary, outgoing bubbles" />
                      <Swatch token="--color-blue-700" role="Hover and pressed" />
                      <Swatch token="--color-blue-500" role="The blue band" />
                      <Swatch token="--color-sky-400" role="CTA on photos, focus ring" />
                      <Swatch token="--color-blue-100" role="Selected rows" />
                      <Swatch token="--color-blue-50" role="Tinted panels" />
                    </Row>
                    <Row label="Ink and surfaces" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      <Swatch token="--color-ink-900" role="Headings" />
                      <Swatch token="--color-ink-700" role="Body text" />
                      <Swatch token="--color-ink-500" role="Meta, captions" />
                      <Swatch token="--color-ink-300" role="Text on navy only" />
                      <Swatch token="--color-line" role="Dividers" />
                      <Swatch token="--color-line-strong" role="Input borders" />
                      <Swatch token="--color-mist" role="Quiet sections" />
                      <Swatch token="--color-navy" role="Footer, Pro hero" />
                      <Swatch token="--color-navy-800" role="Cards on navy" />
                    </Row>
                    <Row label="Signals" note="Only for their meaning. Each also differs by icon." className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      <Swatch token="--color-alert-600" role="Alerts, destructive" />
                      <Swatch token="--color-alert-700" role="Alert text" />
                      <Swatch token="--color-ok-600" role="Done, verified" />
                      <Swatch token="--color-ok-700" role="Ok text on light (added, not in DESIGN.md yet)" />
                      <Swatch token="--color-warn-700" role="Pending, drafts" />
                      <Swatch token="--color-tick" role="Read receipt badge" />
                    </Row>
                    <Row label="Avatar initials" note="Picked from the person's name. No red or green." className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      <Swatch token="--color-avatar-1" role="Amber" />
                      <Swatch token="--color-avatar-2" role="Sky" />
                      <Swatch token="--color-avatar-3" role="Pink" />
                      <Swatch token="--color-avatar-4" role="Teal" />
                      <Swatch token="--color-avatar-5" role="Indigo" />
                      <Swatch token="--color-avatar-6" role="Burnt orange" />
                    </Row>
                    <Row label="Buzz Web dark" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      <Swatch token="--color-dark-bg" role="Background" dark />
                      <Swatch token="--color-dark-surface" role="Surface" dark />
                      <Swatch token="--color-dark-raised" role="Raised" dark />
                      <Swatch token="--color-dark-bubble-in" role="Incoming bubble" dark />
                    </Row>
                  </div>
                </Disclosure>
                <Disclosure title="Type" meta="brand and product scales">
                  <div className="flex flex-col gap-8">
                    <Row label="Brand scale" note="Weight 300 headlines against 500–600 UI." className="flex flex-col gap-4">
                      <Spec code='text-display'><p className="text-display text-ink-900">Display, 76 to 44</p></Spec>
                      <Spec code='text-h1'><p className="text-h1 text-ink-900">Heading one, 60 to 40</p></Spec>
                      <Spec code='text-h2'><p className="text-h2 text-ink-900">Heading two, 52 to 34</p></Spec>
                      <Spec code='text-h3'><p className="text-h3 text-ink-900">Heading three, 22</p></Spec>
                      <Spec code='text-lede'><p className="max-w-[36em] text-lede">Lede, 19. SunPay holds the money until you confirm the order arrived.</p></Spec>
                      <Spec code='text-body'><p className="max-w-[36em] text-body">Body, 16 to 17. Plain, warm and direct. Short sentences, active voice.</p></Spec>
                      <Spec code='text-small'><p className="text-small">Small, 13. Data charges may apply.</p></Spec>
                      <Spec code='text-micro'><p className="text-micro text-ink-500">Micro, 11. 12:27</p></Spec>
                    </Row>
                    <Row label="Product scale" className="flex flex-col gap-4">
                      <Spec code='text-page-title'><p className="text-page-title text-ink-900">Page title, 28</p></Spec>
                      <Spec code='text-section-title'><p className="text-section-title text-ink-900">Section title, 18</p></Spec>
                      <Spec code='text-ui'><p className="text-ui">UI body, 15. Default text in the portal, admin and Buzz Web.</p></Spec>
                      <Spec code='text-label'><p className="text-label text-ink-900">Label, 13</p></Spec>
                      <Spec code='text-meta, formatDateTime()'><p className="text-meta text-ink-500">Meta, 12. {parcel ? formatDateTime(parcel.timeline.at(-1)!.at) : ""}</p></Spec>
                      <Spec code='text-stat tabular-nums, formatNaira()'><p className="text-stat text-ink-900 tabular-nums">{parcel ? formatNaira(parcel.pricing.total) : "₦0"}</p></Spec>
                    </Row>
                  </div>
                </Disclosure>
                <Disclosure title="Space, radius, depth, motion" meta="§4, §6">
                  <div className="flex flex-col gap-8">
                    <Row label="Spacing" note="4px steps, drawn at true size. Sections 104 / 72." className="flex flex-col gap-2">
                      {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 72, 96, 120].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                          <span className="w-10 text-right text-[12px] tabular-nums text-ink-500">{s}</span>
                          <span className="h-3 rounded-full bg-blue-100" style={{ width: s }} />
                          <span className="font-mono text-[11.5px] text-ink-500">p-{s / 4}</span>
                        </div>
                      ))}
                    </Row>
                    <Row label="Radius" note="Bigger containers get bigger radii." className="flex flex-wrap items-end gap-4">
                      {(
                        [
                          ["tag", "6", "rounded-tag size-12"],
                          ["tile", "10", "rounded-tile size-14"],
                          ["field", "14", "rounded-field size-16"],
                          ["card", "20", "rounded-card size-20"],
                          ["panel", "28", "rounded-panel size-24"],
                          ["convo", "32", "rounded-convo size-28"],
                          ["footer", "40", "rounded-footer size-32"],
                        ] as const
                      ).map(([name, px, cls]) => (
                        <Spec key={name} code={`rounded-${name}, ${px}px`} className="items-center">
                          <div className={`${cls} border border-blue-100 bg-blue-50`} />
                        </Spec>
                      ))}
                    </Row>
                    <Row label="Depth" note="Only things that float get a shadow." className="flex flex-wrap gap-6 rounded-convo bg-mist p-6">
                      <Spec code="shadow-float"><div className="grid h-20 w-36 place-items-center rounded-field bg-white text-[13px] text-ink-700 shadow-float">Floating</div></Spec>
                      <Spec code="shadow-hair"><div className="grid h-20 w-36 place-items-center rounded-field bg-white text-[13px] text-ink-700 shadow-hair">Hairline</div></Spec>
                      <Spec code="border border-line"><div className="grid h-20 w-36 place-items-center rounded-field border border-line bg-white text-[13px] text-ink-700">Flat list card</div></Spec>
                    </Row>
                    <Row label="Motion" note="--ease-out for everything. No bounce." className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                      {(
                        [
                          ["--dur-1", "160ms", "Hover, press"],
                          ["--dur-2", "240ms", "Toggles, tabs, chips"],
                          ["--dur-3", "400ms", "Drawers, menus, modals"],
                          ["--dur-4", "550ms", "Bubble pop"],
                          ["--dur-5", "900ms", "Hero text rise, image reveals"],
                        ] as const
                      ).map(([t, v, use]) => (
                        <p key={t} className="flex gap-3 text-[14px]">
                          <span className="w-16 font-mono text-[13px] text-ink-900">{t}</span>
                          <span className="w-14 tabular-nums text-ink-500">{v}</span>
                          <span>{use}</span>
                        </p>
                      ))}
                    </Row>
                  </div>
                </Disclosure>
              </div>
            </Section>

            <Section id="logo" title="Logo" spec="§7" heading="Imagery, icons and logo (§7)" imports='import { Logo } from "@/components/Logo"'>
              <Row label="Variants" note="Placeholder wordmark until the official files arrive.">
                <Spec code='<Logo variant="full" size="lg" />'><Logo variant="full" size="lg" /></Spec>
                <Spec code='<Logo variant="mark" size="lg" />'><Logo variant="mark" size="lg" /></Spec>
                <Spec code='<Logo variant="white" />, on navy'>
                  <div className="rounded-panel bg-navy px-6 py-4">
                    <Logo variant="white" size="lg" />
                  </div>
                </Spec>
              </Row>
            </Section>

            <Section id="aurora" title="Live gradient" spec="§6.3" heading="Live gradient background (brand surfaces only) (§6.3)" imports='className="aurora", "aurora aurora-navy"'>
              <Row label="Light" note="Shown at section height. On a real page the blobs scale with the viewport (60vmax), so the wash is softer than in a small box." className="block">
                <Spec code='<section className="aurora bg-mist section-y">' className="w-full items-stretch">
                  <div className="aurora grid min-h-[440px] place-items-center rounded-panel bg-mist p-8">
                    <p className="max-w-[16em] text-center text-h2">Connect with people and businesses with ease.</p>
                  </div>
                </Spec>
              </Row>
              <Row label="Navy" className="block">
                <Spec code='<section className="aurora aurora-navy bg-navy">' className="w-full items-stretch">
                  <div className="aurora aurora-navy grid min-h-[440px] place-items-center rounded-panel bg-navy p-8">
                    <p className="max-w-[16em] text-center text-h2 text-white">Your business, on the app your customers already use.</p>
                  </div>
                </Spec>
              </Row>
            </Section>
          </Group>

          {/* ============================================================ */}
          <Group id="controls" title="Controls" intro="Everything a person presses, types into or picks from.">
            <Section id="buttons" title="Buttons" spec="§8.1" heading="Shared (§8.1)" imports='import { Button, ButtonLink } from "@/components/Button"'>
              <Row label="Solid" note="The default. Sizes sm and md are 44px tall; lg (56px) is for the main form CTA.">
                <Spec code="<Button>"><Button>Join the waitlist</Button></Spec>
                <Spec code='<Button size="lg">'><Button size="lg">Join the waitlist</Button></Spec>
                <Spec code='<Button size="sm">'><Button size="sm">Add rider</Button></Spec>
                <Spec code="<Button loading>"><Button loading>Saving</Button></Spec>
                <Spec code="<Button disabled>"><Button disabled>Join the waitlist</Button></Spec>
              </Row>
              <Row label="Outline" note="↗ only on links that leave the current area.">
                <Spec code='<ButtonLink variant="outline" external>'>
                  <ButtonLink href="/web" variant="outline" external>Buzz Web</ButtonLink>
                </Spec>
                <Spec code='<Button variant="outline">'><Button variant="outline">Track parcel</Button></Spec>
                <Spec code='<Button variant="outline" disabled>'><Button variant="outline" disabled>Track parcel</Button></Spec>
              </Row>
              <Row label="Light and sky" note="Light is white on the blue band. Sky sits on photos and navy, with ink text for contrast.">
                <Spec code='<Button variant="light">'>
                  <div className="rounded-panel bg-blue-500 p-5"><Button variant="light">Explore Pro Mode</Button></div>
                </Spec>
                <Spec code='<Button variant="sky">'>
                  <div className="rounded-panel bg-navy p-5"><Button variant="sky">Join the waitlist</Button></div>
                </Spec>
              </Row>
              <Row label="Danger and ghost" note="Danger is for destructive actions only, always behind a confirm. Ghost is quiet product UI.">
                <Spec code='<Button variant="danger">'><Button variant="danger">Deactivate rider</Button></Spec>
                <Spec code='<Button variant="danger" loading>'><Button variant="danger" loading>Deactivating</Button></Spec>
                <Spec code='<Button variant="ghost" icon={<Plus />}>'>
                  <Button variant="ghost" icon={<Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />}>Add hub</Button>
                </Spec>
                <Spec code='<Button variant="ghost" size="sm" icon={<Paperclip />}>'>
                  <Button variant="ghost" size="sm" icon={<Paperclip aria-hidden="true" className="size-4" strokeWidth={1.8} />}>Attach</Button>
                </Spec>
              </Row>
            </Section>

            <Section id="states" title="Interaction states" spec="§8.1, §12" heading="Anti-slop checklist (run before calling any screen done) (§12)" imports='data-force="hover | focus | active" (dev only: shows a state without a pointer)'>
              <Row label="Button" note="Focus is the 3px sky ring with a 3px offset, on everything.">
                <Spec code="default"><Button>Save changes</Button></Spec>
                <Spec code='data-force="hover"'><Button data-force="hover">Save changes</Button></Spec>
                <Spec code='data-force="focus"'><Button data-force="focus">Save changes</Button></Spec>
                <Spec code='data-force="active"'><Button data-force="active">Save changes</Button></Spec>
                <Spec code='outline, data-force="hover"'><Button variant="outline" data-force="hover">Track parcel</Button></Spec>
                <Spec code='outline, data-force="focus"'><Button variant="outline" data-force="focus">Track parcel</Button></Spec>
              </Row>
              <Row label="Chip">
                <Spec code="default"><Chip>Lagos</Chip></Spec>
                <Spec code='data-force="hover"'><Chip data-force="hover">Lagos</Chip></Spec>
                <Spec code='data-force="focus"'><Chip data-force="focus">Lagos</Chip></Spec>
                <Spec code='selected, data-force="focus"'><Chip selected data-force="focus">Lagos</Chip></Spec>
              </Row>
              <Row label="Input" className="grid gap-5 md:grid-cols-3">
                <Spec code="default" className="items-stretch"><Input aria-label="Default example" defaultValue="BZT-N293-RKAG" /></Spec>
                <Spec code='data-force="hover"' className="items-stretch"><Input aria-label="Hover example" data-force="hover" defaultValue="BZT-N293-RKAG" /></Spec>
                <Spec code='data-force="focus"' className="items-stretch"><Input aria-label="Focus example" data-force="focus" defaultValue="BZT-N293-RKAG" /></Spec>
              </Row>
            </Section>

            <Section id="chips" title="Chips" spec="§8.1" heading="Shared (§8.1)" imports='import { Chip } from "@/components/Chip"'>
              <Row label="Interactive" note="Single choice. Each chip is a toggle with aria-pressed.">
                <ChipDemo />
              </Row>
              <Row label="States">
                <Spec code="<Chip>"><Chip>Products</Chip></Spec>
                <Spec code="<Chip selected>"><Chip selected>Products</Chip></Spec>
                <Spec code="<Chip count={5}>"><Chip count={5}>In transit</Chip></Spec>
                <Spec code="<Chip icon={<MapPin />}>"><Chip icon={<MapPin aria-hidden="true" className="size-4" strokeWidth={1.8} />}>Lagos</Chip></Spec>
                <Spec code="<Chip disabled>"><Chip disabled>Abuja</Chip></Spec>
              </Row>
            </Section>

            <Section id="fields" title="Inputs and fields" spec="§8.1" heading="Shared (§8.1)" imports='import { Field } from "@/components/Field", import { Input } from "@/components/Input"'>
              <Row label="States" className="grid gap-x-6 gap-y-8 md:grid-cols-2">
                <Spec code="<Field label help>{(p) => <Input {...p} />}" className="items-stretch">
                  <Field label="Tracking ID" help="It starts with BZT-, for example BZT-7Q4K-19XM.">
                    {(p) => <Input {...p} placeholder="BZT-" autoComplete="off" />}
                  </Field>
                </Spec>
                <Spec code="filled" className="items-stretch">
                  <Field label="Phone number">{(p) => <Input {...p} type="tel" inputMode="tel" defaultValue="+234 800 000 4417" />}</Field>
                </Spec>
                <Spec code='<Field error="…">' className="items-stretch">
                  <Field label="Tracking ID" error="That doesn't look like a tracking ID. Check it matches BZT-XXXX-XXXX.">
                    {(p) => <Input {...p} defaultValue="BZT-12" />}
                  </Field>
                </Spec>
                <Spec code="<Input readOnly />: dashed border, white. Select and copy." className="items-stretch">
                  <Field label="Company code" help="Set by Buzz when your company was approved.">
                    {(p) => <Input {...p} defaultValue={partner?.companyCode} readOnly />}
                  </Field>
                </Spec>
                <Spec code="<Input disabled />: grey fill. Not available yet." className="items-stretch">
                  <Field label="Rider code">{(p) => <Input {...p} disabled placeholder="Generated after verification" />}</Field>
                </Spec>
                <Spec code="<Field optional>" className="items-stretch">
                  <Field label="Landmark" optional help="Helps the rider find you.">
                    {(p) => <Input {...p} />}
                  </Field>
                </Spec>
              </Row>
            </Section>

            <Section id="choices" title="Select, checkbox, switch" spec="§8.1, §10.1" heading="guided onboarding" imports='import { Select } from "@/components/Select", import { Checkbox, Switch } from "@/components/Checkbox"'>
              <Row label="Select" note="Styled like Input. Arrow keys and type-ahead work." className="grid gap-x-6 gap-y-8 md:grid-cols-2">
                <Spec code="<Select options placeholder />" className="items-stretch">
                  <Field label="Vehicle">
                    {(p) => (
                      <Select
                        {...p}
                        placeholder="Choose a vehicle"
                        options={[
                          { value: "bike", label: "Motorbike" },
                          { value: "car", label: "Car" },
                          { value: "van", label: "Van" },
                          { value: "truck", label: "Truck", disabled: true },
                        ]}
                      />
                    )}
                  </Field>
                </Spec>
                <Spec code='<Select defaultValue="interstate" /> in an error Field' className="items-stretch">
                  <Field label="Service type" error="Choose at least one service you offer.">
                    {(p) => (
                      <Select
                        {...p}
                        defaultValue="interstate"
                        options={[
                          { value: "intrastate", label: "Intrastate" },
                          { value: "interstate", label: "Interstate" },
                          { value: "international", label: "International (Africa)" },
                        ]}
                      />
                    )}
                  </Field>
                </Spec>
              </Row>
              <Row label="Checkbox" note="The whole row is the 44px target." className="flex max-w-[36em] flex-col">
                <Spec code='<Checkbox label description defaultChecked />' className="items-stretch">
                  <Checkbox label="We confirm our company is registered and verified" description="Buzz checks this at inspection." defaultChecked />
                </Spec>
                <Spec code="<Checkbox label />" className="items-stretch"><Checkbox label="Guarantor form" /></Spec>
                <Spec code='<Checkbox checked="indeterminate" />' className="items-stretch"><Checkbox label="All checks" checked="indeterminate" /></Spec>
                <Spec code="<Checkbox invalid />" className="items-stretch"><Checkbox label="I've read the partner agreement" invalid /></Spec>
                <Spec code="<Checkbox disabled />" className="items-stretch"><Checkbox label="Rider's licence (not required by your company)" disabled /></Spec>
              </Row>
              <Row label="Switch" note="For settings that apply at once." className="flex max-w-[36em] flex-col">
                <Spec code="<Switch label defaultChecked />" className="items-stretch"><Switch label="Keep me signed in" defaultChecked /></Spec>
                <Spec code="<Switch label description />" className="items-stretch"><Switch label="Delivery updates" description="Pin delivery updates to the top of the bell." /></Spec>
                <Spec code="<Switch disabled />" className="items-stretch"><Switch label="SMS updates (coming later)" disabled /></Spec>
              </Row>
            </Section>

            <Section id="codes" title="Codes" spec="§3.4, §8.1" heading="Shared (§8.1)" imports='import { Code } from "@/components/Code"'>
              <Row label="Medium" note="Headers and brand pages.">
                {parcel && <Spec code='<Code label="Tracking ID" showLabel />'><Code value={parcel.trackingId} label="Tracking ID" showLabel /></Spec>}
                {partner && <Spec code='<Code label="Company code" showLabel />'><Code value={partner.companyCode} label="Company code" showLabel /></Spec>}
              </Row>
              <Row label="Small" note="Tables and drawers. The label stays for screen readers.">
                {riders[0] && <Spec code='<Code size="sm" label="Rider code" />'><Code value={riders[0].riderCode} label="Rider code" size="sm" /></Spec>}
                {parcel && <Spec code='<Code size="sm" label="Order ID" />'><Code value={parcel.orderId} label="Order ID" size="sm" /></Spec>}
                <Spec code='<Code copyable={false} />'><Code value="BZT-7Q4K-19XM" label="Example tracking ID" copyable={false} size="sm" /></Spec>
              </Row>
            </Section>

            <Section id="upload" title="Upload slot" spec="§10.1" heading="guided onboarding" imports='import { UploadSlot } from "@/components/UploadSlot"'>
              <Row label="Live" note="Choose any file to watch it upload (simulated)." className="block">
                <UploadDemo />
              </Row>
              <Row label="States" className="flex flex-col gap-3">
                <Spec code='state="empty"' className="items-stretch"><UploadSlot title="Data protection addendum" state="empty" /></Spec>
                <Spec code='state="uploading" progress={64}' className="items-stretch">
                  <UploadSlot title="Rider verification declaration" state="uploading" fileName="rider-declaration.pdf" progress={64} />
                </Spec>
                <Spec code='state="uploaded"' className="items-stretch"><UploadSlot title="Signed partner agreement" state="uploaded" fileName="swiftline-partner-agreement-signed.pdf" /></Spec>
                <Spec code='state="rejected" reason="…"' className="items-stretch">
                  <UploadSlot title="Signed partner agreement" state="rejected" reason="The signature page is missing. Upload all 6 pages, signed." />
                </Spec>
              </Row>
            </Section>
          </Group>

          {/* ============================================================ */}
          <Group id="data" title="Data and feedback" intro="Product-register pieces for the portal, admin and Buzz Web, and how the interface answers back.">
            <Section id="table" title="Table and drawer" spec="§10.2, §10.4" heading="Product-surface rules (§10.4)" imports='import { DataTable } from "@/components/DataTable", import { Drawer } from "@/components/Drawer"'>
              <Row stack label="Parcels" note="48px rows, sticky header, --blue-50 hover. Open a row: it gets the 2px selected inset and the drawer opens. Below 768px rows stack. Switch states with the chips." className="block">
                <TableDemo parcels={parcels} />
              </Row>
            </Section>

            <Section id="tabs" title="Tabs" spec="§10.2" heading="Partner portal (`/logistics/portal`, product register) (§10.2)" imports='import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs"'>
              <Row label="Riders" note="Arrow keys move between tabs." className="block">
                <TabsDemo riders={allRiders} />
              </Row>
            </Section>

            <Section id="steps" title="Step progress" spec="§10.1" heading="guided onboarding" imports='import { StepProgress } from "@/components/StepProgress"'>
              <Row stack label="Partner onboarding" note="A real sequence, so numbers are allowed. Phones show 'Step 3 of 7'." className="block">
                <Spec code="<StepProgress steps={[…7]} current={2} />" className="w-full items-stretch">
                  <StepProgress
                    steps={["Your company", "Services and coverage", "Capacity", "Documents", "Rates", "Book your meeting", "Review"]}
                    current={2}
                  />
                </Spec>
              </Row>
            </Section>

            <Section id="status" title="Status pills" spec="§8.1" heading="Shared (§8.1)" imports='import { StatusPill } from "@/components/StatusPill"'>
              {statusGroups.map(([label, list]) => (
                <Row key={label} label={label}>
                  {list.map((s) => (
                    <Spec key={s} code={`status="${s}"`}>
                      <StatusPill status={s} />
                    </Spec>
                  ))}
                </Row>
              ))}
              <Row label="Small" note='size="sm" for table cells.'>
                {statusGroups.flatMap(([, l]) => l).map((s) => (
                  <StatusPill key={s} status={s} size="sm" />
                ))}
              </Row>
            </Section>

            <Section id="dialogs" title="Confirm dialog" spec="§10.2, §10.3" heading="Buzz admin console (`/admin`, internal, product register) (§10.3)" imports='import { ConfirmDialog } from "@/components/ConfirmDialog"'>
              <Row label="Destructive" note="Danger action, then a confirm that names what happens and what is kept, then a toast that reuses the verb.">
                <ConfirmDemo riderName={riders[0]?.name ?? "this rider"} />
              </Row>
            </Section>

            <Section id="toasts" title="Toasts" spec="§8.1" heading="Shared (§8.1)" imports='import { useToast } from "@/components/Toast"  →  toast({ title, description, tone, action })'>
              <Row label="Live" note="Bottom-centre on phones, bottom-right on desktop. Undo appears only for actions that can be undone.">
                <ToastDemo />
              </Row>
              <Row label="States" className="flex flex-col gap-3 rounded-convo bg-mist p-5">
                <Spec code='tone="success"' className="w-full"><ToastPreview title="Rider deactivated" description="Tunde Bakare's history is kept." /></Spec>
                <Spec code='tone="success" action={{ label: "Undo" }}' className="w-full"><ToastPreview title="Parcel removed from batch" actionLabel="Undo" /></Spec>
                <Spec code='tone="info"' className="w-full"><ToastPreview title="Partner added to Lagos coverage" tone="info" /></Spec>
                <Spec code='tone="error"' className="w-full">
                  <ToastPreview title="Label didn't print" description="Check the printer is on and connected, then print again." tone="error" />
                </Spec>
              </Row>
            </Section>

            <Section id="banners" title="Banners" spec="§11" heading="Buzz Web: page specs (`/web`, product register) (§11)" imports='import { NotificationBanner } from "@/components/NotificationBanner"'>
              <Row label="Tones" className="flex flex-col gap-3 rounded-convo bg-mist p-5">
                <Spec code='tone="delivery"' className="w-full">
                  <NotificationBanner tone="delivery" title="Out for delivery" body="Perfume oil set is on its way. Your delivery code is ready." action={{ label: "Track", href: "/logistics/track/BZT-N293-RKAG" }} />
                </Spec>
                <Spec code='tone="security"' className="w-full">
                  <NotificationBanner tone="security" title="Security update" body="Road blocked at [location]. Avoid the area." action={{ label: "View", href: "/web" }} />
                </Spec>
                <Spec code='tone="offline"' className="w-full">
                  <NotificationBanner tone="offline" title="Your phone is offline" body="Messages will send when it reconnects." />
                </Spec>
              </Row>
            </Section>

            <Section id="empty" title="Empty and loading" spec="§8.1, §10.4" heading="Product-surface rules (§10.4)" imports='import { EmptyState } from "@/components/EmptyState", import { Skeleton } from "@/components/Skeleton"'>
              <Row label="Product" className="block">
                <Spec code='<EmptyState icon title body action />' className="w-full items-stretch">
                  <EmptyState
                    icon={<Users strokeWidth={1.8} />}
                    title="No riders yet."
                    body="Add your first rider to give them a rider code."
                    action={<Button size="sm" icon={<Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />}>Add rider</Button>}
                  />
                </Spec>
              </Row>
              <Row label="Brand" className="block">
                <Spec code='<EmptyState tone="brand" />' className="w-full items-stretch">
                  <EmptyState
                    tone="brand"
                    icon={<Briefcase strokeWidth={1.8} />}
                    title="No open roles right now."
                    body="We still read every message. Tell us what you'd like to work on."
                    action={<ButtonLink href="mailto:hello@aetherjade.space" variant="outline">Email hello@aetherjade.space</ButtonLink>}
                  />
                </Spec>
              </Row>
              <Row label="Skeleton" note="For one-off loading blocks. Tables have their own skeleton rows." className="block">
                <Spec code='<Skeleton className="w-40" />' className="w-full max-w-[420px] items-stretch">
                  <div className="flex flex-col gap-3 rounded-field border border-line p-4" aria-busy="true" aria-label="Loading rider">
                    <Skeleton className="w-40" />
                    <Skeleton className="w-64" />
                    <Skeleton className="w-24" />
                  </div>
                </Spec>
              </Row>
            </Section>

            <Section id="ribbon" title="Test data ribbon" spec="§8.1" heading="Shared (§8.1)" imports='import { TestDataRibbon } from "@/components/TestDataRibbon"'>
              <Row label="Placement" note="Docked in an app shell's top bar, before the bell and account, so it never covers a control. Fixed only where there is no top bar.">
                <Spec code='<TestDataRibbon placement="docked" />'><TestDataRibbon placement="docked" /></Spec>
              </Row>
            </Section>
          </Group>

          {/* ============================================================ */}
          <Group id="chat" title="Chat" intro="The signature. Bubbles carry every surface: heroes, timelines, evidence and Buzz Web itself.">
            <Section id="bubbles" title="Bubbles" spec="§5.1" heading="Anatomy (§5.1)" imports='import { Bubble, Avatar, Typing } from "@/components/chat"'>
              <Row label="Avatars" note="Photo, initials (colour picked from the name), and system marks.">
                <Spec code="<Avatar sender={{ name, src }} />"><Avatar sender={adaeze} size="lg" /></Spec>
                {["Tobi", "Chidi", "Auntie Rose", "Emeka Fix-It", "Amina K.", "Ifeanyi N."].map((n) => (
                  <Spec key={n} code={n}>
                    <Avatar sender={{ name: n }} size="lg" />
                  </Spec>
                ))}
                <Spec code='system="sunpay"'><Avatar sender={sunpay} size="lg" /></Spec>
                <Spec code='system="buzz"'><Avatar sender={buzzLogistics} size="lg" /></Spec>
                <Spec code='system="emba"'><Avatar sender={emba} size="lg" /></Spec>
              </Row>
              <Row label="Variants and receipts" note="Receipts differ by shape: one tick, two ticks, then two ticks on a filled badge." className="block">
                <div className="flex max-w-[560px] flex-col gap-4 rounded-convo bg-blue-50 p-4 sm:p-6">
                  <Spec code='variant="in" onTint' className="w-full items-stretch">
                    <Bubble variant="in" sender={adaeze} onTint time="12:27">Hi, is the green one still available?</Bubble>
                  </Spec>
                  <Spec code='variant="out" status="sent"' className="w-full items-end">
                    <Bubble variant="out" time="12:28" status="sent">Yes o. Size 42 is left.</Bubble>
                  </Spec>
                  <Spec code='status="delivered"' className="w-full items-end">
                    <Bubble variant="out" time="12:28" status="delivered">I fit send am today</Bubble>
                  </Spec>
                  <Spec code='status="read"' className="w-full items-end">
                    <Bubble variant="out" time="12:29" status="read">Pay through SunPay so you&apos;re covered</Bubble>
                  </Spec>
                  <Spec code='variant="system" sender={sunpay}' className="w-full items-stretch">
                    <Bubble variant="system" sender={sunpay} time="12:31">
                      ₦[AMOUNT] is held in escrow. The seller is paid when you confirm the order arrived.
                    </Bubble>
                  </Spec>
                  <Spec code='variant="alert" sender={emba}' className="w-full items-stretch">
                    <Bubble variant="alert" sender={emba} time="12:40">Road blocked at [location]. Avoid the area and use another route.</Bubble>
                  </Spec>
                  <Spec code="<Typing sender onTint />"><Typing sender={tobi} onTint /></Spec>
                </div>
              </Row>
              <Row label="Group, glass, long text" className="grid gap-6 xl:grid-cols-2">
                <Spec code="showName (groups)" className="items-stretch">
                  <div className="flex flex-col gap-2.5 rounded-convo bg-blue-50 p-4">
                    <Bubble variant="in" sender={{ name: "Chidi" }} showName onTint time="08:00">Who&apos;s coming for Christmas?</Bubble>
                    <Bubble variant="in" sender={{ name: "Auntie Rose" }} showName onTint time="08:20">We&apos;ll be there by the 23rd</Bubble>
                    <Bubble variant="out" time="08:30" status="read">I&apos;ll be there on the 22nd</Bubble>
                  </div>
                </Spec>
                <Spec code="glass (over images)" className="items-stretch">
                  <div className="aurora flex flex-col gap-2.5 rounded-convo p-4">
                    <Bubble variant="in" sender={adaeze} glass time="12:27">Delivery came today. Thank you!</Bubble>
                    <Bubble variant="out" time="12:28" status="read">You&apos;re welcome. Enjoy it</Bubble>
                  </div>
                </Spec>
                <Spec code="long text wraps at 82%" className="items-stretch xl:col-span-2">
                  <div className="flex max-w-[420px] flex-col gap-2.5 rounded-convo bg-blue-50 p-4">
                    <Bubble variant="in" sender={tobi} onTint time="12:30">
                      I wan confirm say the address na Plot 14, Ahmadu Bello Way, Garki, before the rider come, abeg
                    </Bubble>
                  </div>
                </Spec>
              </Row>
            </Section>

            <Section id="dark" title="Dark theme" spec="§2.2, §11" heading="Rules (§2.2)" imports='<Bubble theme="dark">, <Convo theme="dark">, <Typing theme="dark">'>
              <Row label="Buzz Web dark" note="Outgoing stays --blue-600. Incoming is #1E2A47." className="block">
                <div className="flex max-w-[560px] flex-col gap-2.5 rounded-convo bg-dark-bg p-4 sm:p-6">
                  <Bubble variant="in" theme="dark" sender={{ name: "Ada's Fabrics" }} time="11:02">Your ankara is ready. I don send am with Swiftline</Bubble>
                  <Bubble variant="out" theme="dark" time="11:04" status="read">Thank you! I&apos;ll track it</Bubble>
                  <Bubble variant="system" theme="dark" sender={sunpay} time="11:05">₦[AMOUNT] is held in escrow until you confirm delivery.</Bubble>
                  <Bubble variant="alert" theme="dark" sender={emba} time="11:20">Road blocked at [location]. Use another route.</Bubble>
                  <Typing sender={{ name: "Ada's Fabrics" }} theme="dark" />
                </div>
              </Row>
            </Section>

            <Section id="order" title="Order card" spec="§11" heading="Buzz Web: page specs (`/web`, product register) (§11)" imports='import { OrderCard } from "@/components/OrderCard"'>
              <Row label="In a chat" className="flex flex-wrap gap-6">
                {parcel && (
                  <Spec code='<OrderCard item status trackingId href />'>
                    <div className="rounded-convo bg-blue-50 p-4">
                      <OrderCard item={parcel.item} status={parcel.status} trackingId={parcel.trackingId} href={`/logistics/track/${parcel.trackingId}`} />
                    </div>
                  </Spec>
                )}
                {parcel && (
                  <Spec code='theme="dark"'>
                    <div className="rounded-convo bg-dark-bg p-4">
                      <OrderCard theme="dark" item={parcel.item} status={parcel.status} trackingId={parcel.trackingId} href={`/logistics/track/${parcel.trackingId}`} />
                    </div>
                  </Spec>
                )}
              </Row>
            </Section>

            <Section id="convo" title="Convo" spec="§5.3" heading="Motion (§5.3)" imports='import { Convo } from "@/components/chat"  →  <Convo messages start="inView" />'>
              <Row label="Hero convo" note="Pops in when scrolled into view, 800ms apart. Typing comes before the last bubble." className="block">
                <div className="max-w-[560px]">
                  <ConvoReplay messages={landedConvo} label="Tobi tells his mum he has landed in Abuja" />
                </div>
              </Row>
              <Row label="From test data" note="Dispute evidence (DSP-3068) through the data layer, with roles." className="block">
                <div className="max-w-[560px]">
                  <ConvoReplay messages={disputeConvo} label="Dispute chat between buyer and seller" />
                </div>
              </Row>
            </Section>

            <Section id="phone" title="Phone frame" spec="§8.1" heading="Shared (§8.1)" imports='import { PhoneFrame } from "@/components/PhoneFrame"'>
              <Row stack label="Screens" note="Real Buzz UI in HTML: chat, alert and order tracking. No fake status bar." className="flex flex-wrap gap-6">
                <PhoneFrame label={`Buzz chat with ${mum.name}`}>
                  <div className="flex items-center gap-3 border-b border-line px-4 pt-5 pb-3">
                    <Avatar sender={mum} size="lg" decorative />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink-900">{mum.name}</p>
                      <p className="truncate text-[12px] text-ink-500">{chat?.buzzId}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-end gap-2 bg-blue-50 px-3 py-4">
                    {chat?.messages.map((m, i) => (
                      <Bubble key={i} variant={m.from === "me" ? "out" : "in"} sender={m.from === "me" ? undefined : mum} status={m.status} onTint time={formatTime(m.at)}>
                        {m.kind === "voice" ? <VoiceNote duration={m.duration ?? "0:00"} /> : m.text}
                      </Bubble>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-line px-3 py-3">
                    <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-mist text-ink-700">
                      <Plus className="size-4" strokeWidth={1.8} />
                    </span>
                    <span className="flex h-9 flex-1 items-center rounded-full bg-mist px-3.5 text-[14px] text-ink-500">Message</span>
                  </div>
                </PhoneFrame>

                <PhoneFrame label="Estate group chat with an EMBA alert">
                  <div className="flex items-center gap-3 border-b border-line px-4 pt-5 pb-3">
                    <Avatar sender={{ name: "Estate Residents" }} size="lg" decorative />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink-900">Estate Residents (Block C)</p>
                      <p className="truncate text-[12px] text-ink-500">[members] members</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-end gap-2 bg-blue-50 px-3 py-4">
                    <NotificationBanner tone="security" title="Security update" body="Within [radius] of [location]" className="mb-2" />
                    <Bubble variant="alert" sender={emba} time="10:30">Road blocked at [location]. Avoid the area.</Bubble>
                    <Bubble variant="in" sender={{ name: "Mr Bello" }} showName onTint time="10:32">Thanks. Everybody stay inside o</Bubble>
                    <Bubble variant="out" time="10:33" status="delivered">Noted, thank you</Bubble>
                  </div>
                </PhoneFrame>

                {tracking && (
                  <PhoneFrame label={`Order tracking for ${tracking.trackingId}`}>
                    <div className="border-b border-line px-4 pt-5 pb-3">
                      <p className="text-[15px] font-semibold text-ink-900">Order tracking</p>
                      <p className="code-text text-[12px] text-ink-500">{tracking.trackingId}</p>
                      <StatusPill status={tracking.status} size="sm" className="mt-2" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 overflow-hidden bg-blue-50 px-3 py-4">
                      {tracking.timeline.slice(0, 4).map((t, i) => (
                        <Bubble key={i} variant="system" sender={buzzLogistics} time={formatTime(t.at)}>
                          {t.label}, {t.city}
                        </Bubble>
                      ))}
                    </div>
                    <div className="border-t border-line px-4 py-3 text-[12px] text-ink-500">With {tracking.partnerName}</div>
                  </PhoneFrame>
                )}
              </Row>
            </Section>
          </Group>

          {/* ============================================================ */}
          <Group id="chrome" title="Site chrome" intro="The brand nav and footer that wrap every marketing page.">
            <Section id="nav" title="Nav" spec="§8.1" heading="Shared (§8.1)" imports='import { Nav } from "@/components/Nav"'>
              <Row label="At the top" note="Transparent. Below 1024px the links move into a full-screen menu: open it from this preview." className="block">
                <Spec code="<Nav />" className="w-full items-stretch">
                  <div className="overflow-hidden rounded-panel border border-line bg-mist">
                    <Nav position="static" forceScrolled={false} label="Nav preview, at the top" />
                  </div>
                </Spec>
              </Row>
              <Row label="After 80px scroll" note="Glass, sticky." className="block">
                <Spec code="glass after window.scrollY > 80" className="w-full items-stretch">
                  <div className="aurora overflow-hidden rounded-panel border border-line">
                    <Nav position="static" forceScrolled label="Nav preview, scrolled" />
                    <div className="h-16" />
                  </div>
                </Spec>
              </Row>
            </Section>

            <section id="footer" aria-labelledby="footer-title" className="scroll-mt-20 border-t border-line pt-12 lg:scroll-mt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <div>
                  <h3 id="footer-title" className="text-h3">Footer</h3>
                  <p className="mt-1.5 font-mono text-[12px] text-ink-500">import {"{ Footer }"} from &quot;@/components/Footer&quot;</p>
                </div>
                <a href={specHref("Shared (§8.1)")} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-[13px] font-medium text-blue-600 underline-offset-4 hover:underline">
                  DESIGN.md §8.1 <span aria-hidden="true">↗</span>
                  <span className="sr-only">(opens the spec in a new tab)</span>
                </a>
              </div>
              <p className="mt-3 text-[14px] text-ink-500">Shown below as this page&apos;s real footer.</p>
            </section>
          </Group>

          {/* ============================================================ */}
          <section id="not-built" aria-labelledby="not-built-title" className="mt-16 scroll-mt-20 rounded-panel bg-mist p-6 md:p-8 lg:scroll-mt-6">
            <h2 id="not-built-title" className="text-h3">Not built yet</h2>
            <p className="mt-2 max-w-[40em] text-ui text-ink-700">
              Build these from their DESIGN.md section when the page that needs them comes up, then add them here.
            </p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {notBuilt.map(([name, spec, heading]) => (
                <li key={name} className="flex flex-wrap items-center justify-between gap-x-4">
                  <span className="py-3 text-ui text-ink-900">{name}</span>
                  <a href={specHref(heading)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-[13px] font-medium text-blue-700 hover:underline">
                    DESIGN.md {spec} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <a href="#top" className="mt-6 inline-flex min-h-11 items-center text-[14px] font-medium text-blue-700 hover:underline">
              Back to top
            </a>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
