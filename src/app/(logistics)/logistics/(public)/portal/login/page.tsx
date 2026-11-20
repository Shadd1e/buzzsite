import type { Metadata } from "next";
import Link from "next/link";
import { Bike } from "lucide-react";
import { PartnerLogin } from "@/components/logistics/PartnerLogin";
import { logisticsLogin } from "@/content/logistics";

export const metadata: Metadata = {
  title: logisticsLogin.meta.title,
  description: logisticsLogin.meta.description,
};

/**
 * Partner sign in (DESIGN.md §10.1): email + password + 2FA code, with a
 * side note that riders sign in in the Buzz app. The form card stands apart
 * from the page (card policy §8.2, rule 3). No motion.
 */
export default function PartnerLoginPage() {
  const c = logisticsLogin;
  return (
    <section aria-labelledby="page-title" className="aurora bg-mist pt-12 pb-18 md:pt-20 md:pb-26">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-start lg:gap-20">
        <div className="lg:pt-6">
          <h1 id="page-title" className="text-h1">
            {c.title}
          </h1>
          <p className="mt-5 max-w-[26em] text-lede text-ink-700">{c.lede}</p>

          <div className="mt-12 max-w-[30em] border-t border-line-strong pt-6">
            <h2 className="flex items-center gap-2.5 text-h3">
              <Bike aria-hidden="true" className="size-6" strokeWidth={1.6} />
              {c.riders.title}
            </h2>
            <p className="mt-2 text-body text-ink-700">{c.riders.body}</p>
          </div>

          <p className="mt-8 text-body text-ink-700">
            {c.apply.text}{" "}
            <Link
              href={c.apply.href}
              className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
            >
              {c.apply.label}
            </Link>
          </p>
        </div>

        <PartnerLogin copy={c} />
      </div>
    </section>
  );
}
