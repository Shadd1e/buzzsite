"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bike, Building2, CircleCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { signupCopy as c } from "@/content/onboarding";
import { cn } from "@/lib/cn";

type Choice = "company" | "individual" | "companyRider";

/**
 * Sign up (DESIGN.md §10.1): a choice between applying as a logistics company
 * or signing up as an individual rider. Riders who work for a company don't
 * sign up: picking that option explains their company registers them.
 * ?as=company-rider opens that answer straight away.
 */
export function SignupChoice() {
  const params = useSearchParams();
  const [choice, setChoice] = useState<Choice | null>(params.get("as") === "company-rider" ? "companyRider" : null);
  const options: Array<{ key: Choice; icon: typeof Bike; title: string; body: string }> = [
    { key: "company", icon: Building2, title: c.options.company.title, body: c.options.company.body },
    { key: "individual", icon: Bike, title: c.options.individual.title, body: c.options.individual.body },
    { key: "companyRider", icon: Users, title: c.options.companyRider.title, body: c.options.companyRider.body },
  ];

  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="sr-only">{c.legend}</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {options.map(({ key, icon: Icon, title, body }) => {
            const on = choice === key;
            return (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-field border-[1.5px] bg-white p-5 transition-colors duration-(--dur-1) ease-out",
                  "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-sky-400",
                  on ? "border-blue-600 bg-blue-50" : "border-line hover:border-ink-500",
                )}
              >
                <input type="radio" name="signup-as" className="sr-only" checked={on} onChange={() => setChoice(key)} />
                <span className="flex items-center justify-between">
                  <Icon aria-hidden="true" className={cn("size-6", on ? "text-blue-600" : "text-ink-700")} strokeWidth={1.6} />
                  {on && <CircleCheck aria-hidden="true" className="size-5 text-blue-600" strokeWidth={1.8} />}
                </span>
                <span className="text-[17px] font-semibold text-ink-900">{title}</span>
                <span className="text-[15px] text-ink-700">{body}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite">
        {choice === "company" && (
          <ButtonLink href={c.options.company.href} size="lg">
            {c.options.company.cta}
          </ButtonLink>
        )}
        {choice === "individual" && (
          <ButtonLink href={c.options.individual.href} size="lg">
            {c.options.individual.cta}
          </ButtonLink>
        )}
        {choice === "companyRider" && (
          <section aria-labelledby="company-rider-title" className="max-w-[40em] rounded-field border border-line bg-white p-5 sm:p-6">
            <h2 id="company-rider-title" className="text-[20px] font-semibold text-ink-900">
              {c.companyRider.title}
            </h2>
            <p className="mt-2 text-body text-ink-700">{c.companyRider.body}</p>
            <p className="mt-2 text-body text-ink-700">{c.companyRider.then}</p>
            <ButtonLink href={c.companyRider.signIn.href} variant="outline" className="mt-4">
              {c.companyRider.signIn.label}
            </ButtonLink>
            <p className="mt-5 border-t border-line pt-4 text-[14px] text-ink-700">
              {c.companyRider.notPartner}{" "}
              <Link href={c.companyRider.apply.href} className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4">
                {c.companyRider.apply.label}
              </Link>
            </p>
          </section>
        )}
      </div>

      <p className="text-[14px] text-ink-700">
        {c.haveAccount.before}{" "}
        <Link href={c.haveAccount.href} className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4">
          {c.haveAccount.label}
        </Link>
      </p>
    </div>
  );
}
