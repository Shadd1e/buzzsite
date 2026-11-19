import Link from "next/link";
import { ButtonLink } from "./Button";
import { Logo } from "./Logo";

/**
 * DESIGN.md §8.1: navy, 40px top radius. Logo + one-line description +
 * waitlist pill. Four columns. Bottom bar: © 2026 Aether Jade Innovation,
 * legal links, social icons (placeholders until accounts are confirmed, §13).
 */
type FooterLink = { href: string; label: string; external?: boolean };

const columns: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Product",
    links: [
      { href: "/app", label: "The App" },
      { href: "/pro", label: "Buzz Pro" },
      { href: "/marketplace", label: "Depot" },
      { href: "/payments", label: "Payments" },
      { href: "/safety", label: "Safety" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/help", label: "Help Centre" },
      { href: "/legal/community-guidelines", label: "Community guidelines" },
      { href: "/legal/safety-guidelines", label: "Safety guidelines" },
    ],
  },
  {
    title: "Also from Buzz",
    links: [
      { href: "/web", label: "Buzz Web", external: true },
      { href: "/logistics", label: "Buzz Logistics", external: true },
      { href: "/logistics/track", label: "Track a package", external: true },
    ],
  },
];

const legal: FooterLink[] = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/cookies", label: "Cookie policy" },
];

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center gap-1 text-[15px] text-ink-300 transition-colors duration-(--dur-1) ease-out hover:text-white";

export function Footer() {
  return (
    <footer className="rounded-t-footer bg-navy text-ink-300">
      <div className="container-page pt-16 pb-8 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <Logo variant="white" size="md" />
            <p className="max-w-[24em] text-[17px] leading-relaxed text-white">
              One HUB that plugs you to everything.
            </p>
            <ButtonLink href="/waitlist" variant="solid">
              Join the waitlist
            </ButtonLink>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="mb-2 text-[14px] font-semibold text-white">{col.title}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                        {l.external && <span aria-hidden="true">↗</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-navy-700 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px]">© 2026 Aether Jade Innovation</p>
          <ul className="flex flex-wrap gap-x-5">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul aria-label="Social accounts (to be confirmed)" className="flex gap-2">
            {["social 1", "social 2", "social 3"].map((s) => (
              <li
                key={s}
                title="Social account to be confirmed"
                className="grid size-11 place-items-center rounded-full border border-dashed border-navy-700 text-[11px] text-ink-300"
              >
                <span aria-hidden="true">[  ]</span>
                <span className="sr-only">[{s}: to be confirmed]</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
