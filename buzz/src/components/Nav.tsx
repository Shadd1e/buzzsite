"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ButtonLink } from "./Button";
import { Logo } from "./Logo";

/**
 * DESIGN.md §8.1 brand nav: logo left · links · right: "Buzz Web ↗" outlined
 * pill + "Join the waitlist" solid pill. Glass after 80px of scroll. On mobile,
 * a full-screen sheet with large 28px links.
 */
export const brandLinks = [
  { href: "/app", label: "The App" },
  { href: "/pro", label: "Buzz Pro" },
  { href: "/marketplace", label: "Depot" },
  { href: "/payments", label: "Payments" },
  { href: "/safety", label: "Safety" },
  { href: "/about", label: "About" },
] as const;

export function Nav({
  forceScrolled,
  position = "sticky",
  label = "Main",
}: {
  /** Render the scrolled (glass) state regardless of scroll, for docs */
  forceScrolled?: boolean;
  /** "static" for previews inside /dev/components */
  position?: "sticky" | "static";
  /** Landmark name. Previews pass their own so the page keeps one "Main". */
  label?: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceScrolled !== undefined) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [forceScrolled]);

  const isGlass = forceScrolled ?? scrolled;
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "z-40 w-full transition-[background-color,box-shadow,backdrop-filter] duration-(--dur-2) ease-out",
        position === "sticky" && "sticky top-0",
        isGlass ? "glass shadow-hair" : "bg-transparent",
      )}
    >
      <nav aria-label={label} className="container-page flex h-[72px] items-center gap-4 xl:gap-6">
        <Link href="/" aria-label="Buzz home" className="-m-2 shrink-0 rounded-tile p-2">
          <Logo size="sm" />
        </Link>

        <ul className="hidden flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1">
          {brandLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isCurrent(l.href) ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-3 text-[15px] font-medium whitespace-nowrap xl:px-3.5",
                  "transition-colors duration-(--dur-1) ease-out",
                  isCurrent(l.href) ? "text-ink-900" : "text-ink-700 hover:text-ink-900",
                  "aria-[current=page]:bg-blue-50",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <ButtonLink href="/web" variant="outline" size="sm" external>
            Buzz Web
          </ButtonLink>
          <ButtonLink href="/waitlist" variant="solid" size="sm">
            Join the waitlist
          </ButtonLink>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            className="ml-auto grid size-11 place-items-center rounded-full text-ink-900 hover:bg-mist lg:hidden"
            aria-label="Open menu"
          >
            <Menu aria-hidden="true" className="size-6" strokeWidth={1.8} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Content
              className={cn(
                "fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white",
                "data-[state=open]:animate-[sheet-in_var(--dur-3)_var(--ease-out)]",
              )}
            >
              <div className="container-page flex h-[72px] shrink-0 items-center justify-between">
                <Logo size="sm" />
                <Dialog.Close
                  className="grid size-11 place-items-center rounded-full text-ink-900 hover:bg-mist"
                  aria-label="Close menu"
                >
                  <X aria-hidden="true" className="size-6" strokeWidth={1.8} />
                </Dialog.Close>
              </div>
              <Dialog.Title className="sr-only">Menu</Dialog.Title>
              <Dialog.Description className="sr-only">Pages on the Buzz site</Dialog.Description>
              <ul className="container-page flex flex-col pt-4 pb-8">
                {brandLinks.map((l) => (
                  <li key={l.href} className="border-b border-line last:border-b-0">
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={isCurrent(l.href) ? "page" : undefined}
                      className="flex min-h-16 items-center text-[28px] leading-tight font-light tracking-[-0.02em] text-ink-900 aria-[current=page]:text-blue-600"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="container-page mt-auto flex flex-col gap-3 pb-8">
                <ButtonLink href="/waitlist" size="lg" onClick={() => setOpen(false)}>
                  Join the waitlist
                </ButtonLink>
                <ButtonLink href="/web" variant="outline" size="lg" external onClick={() => setOpen(false)}>
                  Buzz Web
                </ButtonLink>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </header>
  );
}
