"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenu, Popover } from "radix-ui";
import {
  Bell,
  Bike,
  Building2,
  Calculator,
  ChevronDown,
  Flag,
  Layers,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Package,
  Printer,
  Route,
  Scale,
  ShieldCheck,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { Code } from "@/components/Code";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/Skeleton";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { cn } from "@/lib/cn";
import { ROLE_LABEL, type Permission } from "@/lib/portal-access";
import { listCompanyFlags, listCompanyRiders } from "@/lib/data";
import { usePortal, useLoad } from "./session";

/**
 * Partner portal shell (DESIGN.md §10.2): left sidebar (a bottom bar on
 * phones) + top bar with company name, company code (copy), bell and account.
 * Light, 1px borders, no shadows except menus. Nav items a role can't use are
 * not shown.
 */
export const NAV: Array<{ href: string; label: string; icon: typeof Bike; permission: Permission; exact?: boolean }> = [
  { href: "/logistics/portal", label: "Overview", icon: LayoutDashboard, permission: "view_overview", exact: true },
  { href: "/logistics/portal/parcels", label: "Parcels", icon: Package, permission: "view_parcels" },
  { href: "/logistics/portal/label", label: "Generate label", icon: Printer, permission: "print_label" },
  { href: "/logistics/portal/batches", label: "Batches", icon: Layers, permission: "view_batches" },
  { href: "/logistics/portal/riders", label: "Riders", icon: Bike, permission: "view_riders" },
  { href: "/logistics/portal/stops", label: "Stops", icon: Route, permission: "view_stops" },
  { href: "/logistics/portal/hubs", label: "Hubs & pickup points", icon: Warehouse, permission: "view_hubs" },
  { href: "/logistics/portal/rates", label: "Rates", icon: Calculator, permission: "view_rates" },
  { href: "/logistics/portal/payouts", label: "Payouts", icon: Wallet, permission: "view_payouts" },
  { href: "/logistics/portal/disputes", label: "Disputes & claims", icon: Scale, permission: "view_disputes" },
  { href: "/logistics/portal/flags", label: "Flags", icon: Flag, permission: "view_flags" },
  { href: "/logistics/portal/team", label: "Team", icon: Users, permission: "manage_team" },
  { href: "/logistics/portal/company", label: "Company", icon: Building2, permission: "view_company" },
];

/** Phones: the bottom bar holds these four plus More (the rest) */
export const BOTTOM_BAR = ["Overview", "Parcels", "Batches", "Riders"];
const MORE = { href: "/logistics/portal/more", label: "More", icon: MoreHorizontal, exact: false };

function useActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
}

export function PortalShell({ children }: { children: ReactNode }) {
  const { company, can } = usePortal();
  const isActive = useActive();
  const pathname = usePathname();
  const items = NAV.filter((n) => can(n.permission));
  const bottom = [...items.filter((n) => BOTTOM_BAR.includes(n.label)), MORE];
  // "More" stays lit on the More page and on any screen that lives in it
  const inMore = pathname === MORE.href || items.some((n) => !BOTTOM_BAR.includes(n.label) && isActive(n.href, n.exact));

  return (
    <div className="min-h-dvh bg-mist md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <a
        href="#portal-main"
        className="sr-only z-50 rounded-full bg-ink-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Sidebar, tablet and up */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-white md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <Logo size="sm" />
          <span className="text-[13px] font-medium text-ink-500">Partner portal</span>
        </div>
        <nav aria-label="Portal" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {items.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-tile px-3 text-[15px] font-medium transition-colors duration-(--dur-1) ease-out",
                      active ? "bg-blue-50 text-blue-700" : "text-ink-700 hover:bg-mist hover:text-ink-900",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <SidebarAccount />
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <p className="truncate text-[15px] font-semibold text-ink-900">{company.name}</p>
            {/* Wrapper carries the breakpoint: Code sets its own display */}
            <span className="hidden sm:block">
              <Code value={company.companyCode} label="Company code" size="sm" />
            </span>
          </div>
          <TestDataRibbon placement="docked" />
          <AttentionBell />
          <AccountMenu />
        </header>

        <main id="portal-main" className="flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-16">
          {children}
        </main>
      </div>

      {/* Bottom bar, phones */}
      <nav aria-label="Portal" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${bottom.length}, minmax(0, 1fr))` }}>
          {bottom.map(({ href, label, icon: Icon, exact }) => {
            const active = href === MORE.href ? inMore : isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-15 flex-col items-center justify-center gap-1 text-[12px] font-medium",
                    active ? "text-blue-700" : "text-ink-500",
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" strokeWidth={active ? 2 : 1.7} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function RoleBadge({ role }: { role: "super_admin" | "manager" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-medium",
        role === "super_admin" ? "bg-ink-900 text-white" : "bg-blue-50 text-blue-700",
      )}
    >
      {role === "super_admin" && <ShieldCheck aria-hidden="true" className="size-3.5" strokeWidth={1.8} />}
      {ROLE_LABEL[role]}
    </span>
  );
}

export { RoleBadge };

function SidebarAccount() {
  const { staff, signOut } = usePortal();
  return (
    <div className="border-t border-line p-4">
      <div className="flex items-center gap-3">
        <Avatar sender={{ name: staff.name }} size="lg" decorative />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-ink-900">{staff.name}</p>
          <RoleBadge role={staff.role} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => signOut()}
        className="mt-3 flex h-11 w-full items-center gap-2 rounded-tile px-3 text-[14px] font-medium text-ink-700 hover:bg-mist hover:text-ink-900"
      >
        <LogOut aria-hidden="true" className="size-4" strokeWidth={1.8} />
        Sign out
      </button>
    </div>
  );
}

function AccountMenu() {
  const { staff, company, signOut } = usePortal();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`Account: ${staff.name}, ${ROLE_LABEL[staff.role]}`}
        className="flex h-11 items-center gap-1.5 rounded-full pr-2 pl-1 hover:bg-mist md:hidden"
      >
        <Avatar sender={{ name: staff.name }} size="md" decorative />
        <ChevronDown aria-hidden="true" className="size-4 text-ink-500" strokeWidth={1.8} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-64 rounded-field border border-line bg-white p-1.5 shadow-float data-[state=open]:animate-dialog-in"
        >
          <div className="px-3 py-2.5">
            <p className="text-[14px] font-semibold text-ink-900">{staff.name}</p>
            <p className="truncate text-meta text-ink-500">{staff.email}</p>
            <div className="mt-2">
              <RoleBadge role={staff.role} />
            </div>
            <div className="mt-3 sm:hidden">
              <Code value={company.companyCode} label="Company code" size="sm" showLabel />
            </div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item
            onSelect={() => signOut()}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-tile px-3 text-[15px] text-ink-900 outline-none data-[highlighted]:bg-blue-50"
          >
            <LogOut aria-hidden="true" className="size-4" strokeWidth={1.8} />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Bell: what needs a decision today (pending riders, open flags). */
function AttentionBell() {
  const { session } = usePortal();
  const data = useLoad(
    () => Promise.all([listCompanyRiders(session, { status: "pending_verification" }), listCompanyFlags(session)]),
    [session.staffId],
  );
  const pending = data.data?.[0] ?? [];
  const flags = (data.data?.[1] ?? []).filter((f) => f.status === "open");
  const count = pending.length + flags.length;

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={count ? `Needs attention: ${count}` : "Needs attention: nothing new"}
        className="relative grid size-11 shrink-0 place-items-center rounded-full text-ink-700 hover:bg-mist hover:text-ink-900"
      >
        <Bell aria-hidden="true" className="size-5" strokeWidth={1.7} />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold text-white tabular-nums">
            {count}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[min(340px,calc(100vw-24px))] rounded-field border border-line bg-white p-2 shadow-float data-[state=open]:animate-dialog-in"
        >
          <p className="px-3 pt-2 pb-1 text-section-title text-ink-900">Needs attention</p>
          {data.state === "loading" ? (
            <div className="flex flex-col gap-2 px-3 py-3">
              <Skeleton className="w-48" />
              <Skeleton className="w-36" />
            </div>
          ) : count === 0 ? (
            <p className="px-3 py-3 text-ui text-ink-500">Nothing needs you right now.</p>
          ) : (
            <ul className="divide-y divide-line">
              {pending.map((r) => (
                <li key={r.id}>
                  <Popover.Close asChild>
                    <Link href={`/logistics/portal/riders/${r.id}`} className="block rounded-tile px-3 py-2.5 hover:bg-blue-50">
                      <span className="block text-ui text-ink-900">{r.name} is waiting for verification</span>
                      <span className="block text-meta text-ink-500">They can&apos;t sign in to the app until you confirm them.</span>
                    </Link>
                  </Popover.Close>
                </li>
              ))}
              {flags.map((f) => (
                <li key={f.id} className="px-3 py-2.5">
                  <span className="block text-ui text-ink-900">{f.label}</span>
                  <span className="code-text block text-meta text-ink-500">{f.trackingId}</span>
                </li>
              ))}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Shown while the session loads: the frame without anything session-specific. */
export function PortalShellFallback() {
  return (
    <div className="min-h-dvh bg-mist md:grid md:grid-cols-[232px_minmax(0,1fr)]" aria-busy="true">
      <aside className="hidden h-dvh border-r border-line bg-white md:block">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <Logo size="sm" />
          <span className="text-[13px] font-medium text-ink-500">Partner portal</span>
        </div>
      </aside>
      <div>
        <div className="flex h-16 items-center border-b border-line bg-white px-4 md:px-8">
          <Skeleton className="w-44" />
        </div>
        <div className="flex flex-col gap-3 px-4 pt-8 md:px-8">
          <span className="sr-only" role="status">Loading the partner portal</span>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="w-72" />
        </div>
      </div>
    </div>
  );
}
