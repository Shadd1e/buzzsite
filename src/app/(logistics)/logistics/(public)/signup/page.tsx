import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupChoice } from "@/components/onboarding/SignupChoice";
import { signupCopy as c } from "@/content/onboarding";

export const metadata: Metadata = { title: c.meta.title, description: c.meta.description };

/** Sign up (DESIGN.md §10.1): logistics company, individual rider, or "my company signs me up" */
export default function SignupPage() {
  return (
    <section aria-labelledby="page-title" className="bg-mist pt-10 pb-16 md:pt-16 md:pb-24">
      <div className="container-page">
        <h1 id="page-title" className="text-h1">
          {c.title}
        </h1>
        <p className="mt-3 max-w-[32em] text-lede text-ink-700">{c.lede}</p>
        <div className="mt-10">
          <Suspense>
            <SignupChoice />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
