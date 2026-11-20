"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CircleCheck, FlaskConical } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import type { logisticsLogin } from "@/content/logistics";

/**
 * Partner sign in (DESIGN.md §10.1): email + password, then a 2FA code.
 * There's no auth service yet, so it's simulated (any email and password,
 * code 123456) and the form says so. Errors are inline per field.
 */
type Copy = typeof logisticsLogin;
type Step = "credentials" | "code" | "done";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEST_CODE = "123456";

export function PartnerLogin({ copy }: { copy: Copy }) {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string }>({});
  const [busy, setBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Move focus to the new step's heading so keyboard and screen reader users follow along
  useEffect(() => {
    if (step !== "credentials") heading.current?.focus();
  }, [step]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function later(fn: () => void) {
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      fn();
    }, 600);
  }

  function submitCredentials(e: FormEvent) {
    e.preventDefault();
    const next = {
      email: EMAIL.test(email.trim()) ? undefined : copy.errors.email,
      password: password ? undefined : copy.errors.password,
    };
    setErrors(next);
    if (next.email || next.password) return;
    later(() => setStep("code"));
  }

  function submitCode(e: FormEvent) {
    e.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) return setErrors({ code: copy.errors.code });
    setErrors({});
    later(() => (digits === TEST_CODE ? setStep("done") : setErrors({ code: copy.wrongCode })));
  }

  return (
    <div className="rounded-convo border border-line bg-white p-6 sm:p-10">
      {step === "done" ? (
        <div role="status">
          <CircleCheck aria-hidden="true" className="size-9 text-ok-600" strokeWidth={1.6} />
          <h2 ref={heading} tabIndex={-1} className="mt-4 text-[28px] leading-tight font-light tracking-[-0.02em] outline-none">
            {copy.success.title}
          </h2>
          <p className="mt-3 text-body text-ink-700">{copy.success.body}</p>
          <ButtonLink href={copy.success.action.href} size="lg" className="mt-8">
            {copy.success.action.label}
          </ButtonLink>
        </div>
      ) : step === "code" ? (
        <form onSubmit={submitCode} noValidate className="flex flex-col gap-6">
          <div>
            <h2 ref={heading} tabIndex={-1} className="text-[28px] leading-tight font-light tracking-[-0.02em] outline-none">
              Check your authenticator
            </h2>
            <p className="mt-2 text-body text-ink-700">
              {copy.steps.codeIntro} <strong className="font-semibold text-ink-900 break-all">{email.trim()}</strong>.
            </p>
          </div>
          <Field label={copy.fields.code.label} help={copy.fields.code.help} error={errors.code}>
            {(props) => (
              <Input
                {...props}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, "").slice(0, 7))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="code-text text-[20px] tracking-[0.3em] placeholder:tracking-[0.3em]"
              />
            )}
          </Field>
          <Button type="submit" size="lg" loading={busy} className="w-full">
            {copy.steps.verify}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              setCode("");
              setErrors({});
            }}
            className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
          >
            {copy.steps.back}
          </button>
        </form>
      ) : (
        <form onSubmit={submitCredentials} noValidate className="flex flex-col gap-6">
          <Field label={copy.fields.email.label} error={errors.email}>
            {(props) => (
              <Input
                {...props}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                placeholder={copy.fields.email.placeholder}
              />
            )}
          </Field>
          <Field label={copy.fields.password.label} error={errors.password}>
            {(props) => (
              <Input
                {...props}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            )}
          </Field>
          <Button type="submit" size="lg" loading={busy} className="w-full">
            {copy.steps.signIn}
          </Button>
          <Link
            href={copy.forgot.href}
            className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
          >
            {copy.forgot.label}
          </Link>
        </form>
      )}

      {step !== "done" && (
        <p className="mt-6 flex items-start gap-2 rounded-field bg-warn-50 px-4 py-3 text-[14px] leading-snug text-warn-700">
          <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
          {copy.test}
        </p>
      )}
    </div>
  );
}
