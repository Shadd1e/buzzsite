"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * "Partner staff? Sign in here": the last line of the rider card, so partner
 * staff don't have to hunt for their form. It sets ?as=partner, which opens
 * the partner card, scrolls to it and focuses the email field. Without JS it
 * is a plain #partner anchor.
 */
export function PartnerJump({ label }: { label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <a
      href="#partner"
      onClick={(e) => {
        e.preventDefault();
        const q = new URLSearchParams(params.toString());
        q.set("as", "partner");
        router.replace(`${pathname}?${q.toString()}`, { scroll: false });
        if (params.get("as") === "partner") {
          // Already set: the card is open, so just go there
          const band = document.getElementById("partner");
          band?.scrollIntoView({ block: "start" });
          band?.querySelector<HTMLInputElement>("#partner-form input")?.focus({ preventScroll: true });
        }
      }}
      // Inline in a sentence, so no 44px box (WCAG inline-link exception)
      className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
    >
      {label}
    </a>
  );
}
