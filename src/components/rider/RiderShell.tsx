"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  Flag,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  MoreHorizontal,
  Package,
  Scale,
  UserRound,
  Wallet,
} from "lucide-react";
import { Avatar } from "@/components/chat";
import { ButtonLink } from "@/components/Button";
import { Code } from "@/components/Code";
import { EmptyState } from "@/components/EmptyState";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/Skeleton";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { getRiderHome, type RiderHome } from "@/lib/data";
import { cn } from "@/lib/cn";
import { RIDER_PATH } from "@/lib/portal-access";

/**
 * Rider portal shell (DESIGN.md §10.2, individual rider portal): same shell
 * and register as the partner portal with a smaller menu. Top bar shows the
 * rider's name and rider code instead of a company. Phone-first: on phones the
 * bottom bar holds Overview, Parcels, Batches, Payouts and More.
 *
 * Company riders get the screens that are about them (Overview, Parcels,
 * Batches, Flags, Profile). Their company handles rates, pay and disputes.
 */
type NavItem = { href: string; label: string; icon: typeof Package; exact?: boolean; individualOnly?: boolean };

export const RIDER_NAV: NavItem[] = [
  { href: RIDER_PATH, label: "Overview", icon: LayoutDashboard, exact: true },
  { href: `${RIDER_PATH}/parcels`, label: "Parcels", icon: Package },
  { href: `${RIDER_PATH}/batches`, label: "Batches", icon: Layers },
  { href: `${RIDER_PATH}/rates`, label: "Rates", icon: Calculator, individualOnly: true },
  { href: `${RIDER_PATH}/payouts`, label: "Payouts", icon: Wallet, individualOnly: true },
  { href: `${RIDER_PATH}/disputes`, label: "Disputes & claims", icon: Scale, individualOnly: true },
  { href: `${RIDER_PATH}/flags`, label: "Flags", icon: Flag },
  { href: `${RIDER_PATH}/profile`, label: "Profile", icon: UserRound },
];

const MORE: NavItem = { href: `${RIDER_PATH}/more`, label: "More", icon: MoreHorizontal };
const BOTTOM_INDIVIDUAL = ["Overview", "Parcels", "Batches", "Payouts"];

const Ctx = createContext<RiderHome | null>(null);

/** Who's signed in to the rider portal (name, kind, rider code, company) */
export function useRider(): RiderHome {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRider must be used inside <RiderShell>");
  return v;
}

export function navFor(kind: RiderHome["kind"]): NavItem[] {
  return RIDER_NAV.filter((n) => kind === "individual" || !n.individualOnly);
}

function useActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
}

export function RiderShell({ children }: { children: ReactNode }) {
  const { session } = useAccount();
  const home = useLoad(() => getRiderHome(session), [session.id]);
  const isActive = useActive();
  const pathname = usePathname();

  if (home.state !== "ready") return <RiderShellFrame loading />;

  const me = home.data;
  const items = navFor(me.kind);
  const bottom =
    me.kind === "individual" ? [...items.filter((n) => BOTTOM_INDIVIDUAL.includes(n.label)), MORE] : items;
  // A company rider who opens an individual-only screen (Rates, Payouts, Disputes)
  const blocked = RIDER_NAV.find((n) => n.individualOnly && isActive(n.href))
    ? me.kind !== "individual"
    : false;
  const onMore = pathname === MORE.href;

  return (
    <Ctx.Provider value={me}>
      <div className="min-h-dvh bg-mist md:grid md:grid-cols-[232px_minmax(0,1fr)]">
        <a
          href="#rider-main"
          className="sr-only z-50 rounded-full bg-ink-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>

        {/* Sidebar, tablet and up */}
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-white md:flex">
          <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
            <Logo size="sm" />
            <span className="text-[13px] font-medium text-ink-500">Rider</span>
          </div>
          <nav aria-label="Rider portal" className="flex-1 overflow-y-auto px-3 py-4">
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
          <SidebarAccount me={me} />
        </aside>

        <div className="flex min-w-0 flex-col">
          {/* Top bar: the rider's name and rider code instead of a company */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <p className="truncate text-[15px] font-semibold text-ink-900">{me.name}</p>
              {me.riderCode && (
                <span className="hidden sm:block">
                  <Code value={me.riderCode} label="Rider code" size="sm" />
                </span>
              )}
              {me.company && <span className="hidden truncate text-meta text-ink-500 lg:block">{me.company}</span>}
            </div>
            <TestDataRibbon placement="docked" />
          </header>

          <main id="rider-main" className="flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-16">
            {blocked ? <CompanyHandles company={me.company} /> : children}
          </main>
        </div>

        {/* Bottom bar, phones */}
        <nav
          aria-label="Rider portal"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <ul className="grid" style={{ gridTemplateColumns: `repeat(${bottom.length}, minmax(0, 1fr))` }}>
            {bottom.map(({ href, label, icon: Icon, exact }) => {
              // "More" stays lit while on a screen that lives in it
              const active =
                href === MORE.href
                  ? onMore || items.some((n) => !BOTTOM_INDIVIDUAL.includes(n.label) && isActive(n.href, n.exact))
                  : isActive(href, exact);
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
    </Ctx.Provider>
  );
}

function SidebarAccount({ me }: { me: RiderHome }) {
  const { signOut } = useAccount();
  return (
    <div className="border-t border-line p-4">
      <div className="flex items-center gap-3">
        <Avatar sender={{ name: me.name }} size="lg" decorative />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-ink-900">{me.name}</p>
          <p className="truncate text-meta text-ink-500">{me.kind === "individual" ? "Individual rider" : `Rider, ${me.company}`}</p>
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

/** Company riders opening Rates, Payouts or Disputes */
function CompanyHandles({ company }: { company: string | null }) {
  return (
    <EmptyState
      icon={<Lock strokeWidth={1.7} />}
      title={`${company ?? "Your company"} handles this for you.`}
      body="Rates, pay and disputes for company riders are set and settled by the company. Ask them if you have a question."
      action={
        <ButtonLink href={RIDER_PATH} variant="outline" size="sm">
          Go to overview
        </ButtonLink>
      }
    />
  );
}

/** While the rider loads: the frame with nothing rider-specific */
export function RiderShellFrame({ loading = false }: { loading?: boolean }) {
  return (
    <div className="min-h-dvh bg-mist md:grid md:grid-cols-[232px_minmax(0,1fr)]" aria-busy={loading || undefined}>
      <aside className="hidden h-dvh border-r border-line bg-white md:block">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <Logo size="sm" />
          <span className="text-[13px] font-medium text-ink-500">Rider</span>
        </div>
      </aside>
      <div>
        <header className="flex h-16 items-center gap-3 border-b border-line bg-white px-4 md:px-8">
          <Skeleton className="h-4 w-40" />
          <span className="ml-auto">
            <TestDataRibbon placement="docked" />
          </span>
        </header>
      </div>
    </div>
  );
}
