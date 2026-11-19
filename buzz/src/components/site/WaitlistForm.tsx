"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck, Share2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Chip } from "@/components/Chip";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";

/**
 * Waitlist form card (DESIGN.md §9.10): name, phone or email, city chips,
 * consent, big CTA; success state with a share button. Front end only, so
 * the success state says nothing was stored.
 */
type Errors = Partial<Record<"name" | "contact" | "city" | "consent", string>>;

export function WaitlistForm({
  form,
  success,
}: {
  form: { title: string; cities: readonly string[]; consent: string; privacyLink: { label: string; href: string }; cta: string };
  success: { title: string; body: string; testNote: string; share: string; shareText: string; copied: string };
}) {
  const [city, setCity] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  // After a submit: focus the first invalid control, or the confirmation.
  useEffect(() => {
    if (attempt === 0) return;
    if (done) doneRef.current?.focus();
    else formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-error-target]')?.focus();
  }, [attempt, done]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!String(data.get("name") ?? "").trim()) next.name = "Add your name.";
    const contact = String(data.get("contact") ?? "").trim();
    if (!contact) next.contact = "Add a phone number or email so we can tell you when Buzz is live.";
    else if (!/@/.test(contact) && !/^\+?[\d\s-]{7,}$/.test(contact))
      next.contact = "That doesn't look like a phone number or email. Check it and try again.";
    if (!city) next.city = "Pick your city, or choose Somewhere else.";
    if (!consent) next.consent = "Tick the box so we're allowed to contact you.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
    setAttempt((n) => n + 1);
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (navigator.share) await navigator.share({ text: success.shareText, url });
      else {
        await navigator.clipboard.writeText(`${success.shareText} ${url}`);
        setCopied(true);
      }
    } catch {
      /* the person closed the share sheet */
    }
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-convo bg-white p-6 ring-1 ring-line md:p-10">
        <CircleCheck aria-hidden="true" className="size-10 text-ok-700" strokeWidth={1.5} />
        <h2 ref={doneRef} tabIndex={-1} className="text-h2 outline-none">
          {success.title}
        </h2>
        <p className="text-lede text-ink-700">{success.body}</p>
        <p className="rounded-full bg-warn-50 px-3 py-1 text-[13px] font-semibold text-warn-700">{success.testNote}</p>
        <Button size="lg" icon={<Share2 aria-hidden="true" className="size-5" strokeWidth={1.8} />} onClick={share}>
          {success.share}
        </Button>
        <p aria-live="polite" className="text-[14px] text-ink-700">
          {copied ? success.copied : ""}
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-5 rounded-convo bg-white p-6 ring-1 ring-line md:p-10">
      <h2 className="text-h3">{form.title}</h2>
      <Field label="Your name" error={errors.name}>
        {(p) => <Input {...p} name="name" autoComplete="name" />}
      </Field>
      <Field label="Phone number or email" help="We'll only use it to tell you about the launch." error={errors.contact}>
        {(p) => <Input {...p} name="contact" autoComplete="on" />}
      </Field>
      <fieldset aria-describedby={errors.city ? "city-error" : undefined}>
        <legend className="mb-2 text-[14px] font-semibold text-ink-900">Your city</legend>
        <div className="flex flex-wrap gap-2">
          {form.cities.map((c, i) => (
            <Chip
              key={c}
              selected={city === c}
              onClick={() => setCity(c)}
              data-error-target={errors.city && i === 0 ? "" : undefined}
              aria-describedby={errors.city ? "city-error" : undefined}
            >
              {c}
            </Chip>
          ))}
        </div>
        {errors.city && (
          <p id="city-error" className="mt-2 flex items-start gap-1.5 text-[14px] text-alert-700">
            <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
            {errors.city}
          </p>
        )}
      </fieldset>
      <div>
        <Checkbox
          label={form.consent}
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          invalid={!!errors.consent}
          errorId={errors.consent ? "consent-error" : undefined}
        />
        {errors.consent && (
          <p id="consent-error" className="flex items-start gap-1.5 text-[14px] text-alert-700">
            <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
            {errors.consent}
          </p>
        )}
        <Link href={form.privacyLink.href} className="inline-flex min-h-11 items-center text-[14px] font-medium text-blue-700 underline underline-offset-4">
          {form.privacyLink.label}
        </Link>
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        {form.cta}
      </Button>
    </form>
  );
}
