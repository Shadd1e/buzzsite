import type { Metadata } from "next";
import { PartnerApply } from "@/components/onboarding/PartnerApply";
import { partnerApplyCopy as c } from "@/content/onboarding";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

/** Partner apply (DESIGN.md §10.1): guided onboarding in 7 steps */
export default function PartnerApplyPage() {
  return (
    <section
      aria-labelledby="page-title"
      className="bg-mist pt-10 pb-16 md:pt-16 md:pb-24"
    >
      <div className="container-page">
        <div className="mx-auto max-w-[880px]">
          <h1 id="page-title" className="text-h1">
            {c.title}
          </h1>
          <p className="mt-3 max-w-[34em] text-lede text-ink-700">{c.lede}</p>
          <div className="mt-8 md:mt-10">
            <PartnerApply />
          </div>
        </div>
      </div>
    </section>
  );
}
