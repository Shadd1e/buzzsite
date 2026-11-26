"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Bubble } from "@/components/chat";
import { writeAccountCookie } from "@/components/account/session";
import { writeSessionCookie } from "@/components/portal/session";
import {
  completeSignIn,
  listTestAccounts,
  startSignIn,
  TEST_CREDENTIALS,
} from "@/lib/data";
import { formatTime } from "@/lib/data/format";
import { accountHome, ROLE_LABEL, safeNextPath } from "@/lib/portal-access";
import {
  fill,
  ForgotPassword,
  FormAlert,
  TestAccountList,
  TestNote,
  textLink,
  type SignInCopy,
} from "./shared";

/**
 * Partner sign in (DESIGN.md §10.1): a quiet band below rider sign in.
 * Closed by default; opens on "Sign in as partner staff", or by itself when
 * the visitor came from the portal (expired session, ?next=) or a link with
 * ?as=partner. Work email + password, then a 6-digit 2FA code. Five wrong
 * passwords lock the account for 15 minutes; three wrong codes end the
 * attempt. Role comes from the account, never the form. Approved staff go
 * to the partner portal; staff of a company still in review go to the review
 * status page.
 */
type Step = "credentials" | "code";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PartnerSignIn({ copy }: { copy: SignInCopy }) {
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get("reason") as keyof SignInCopy["notices"] | null;
  const notice = reason && reason in copy.notices ? copy.notices[reason] : null;
  const fromPortal =
    !!notice || params.has("next") || params.get("as") === "partner";

  const [opened, setOpen] = useState(false);
  const open = opened || fromPortal;
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    code?: string;
    form?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const band = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const formError = useRef<HTMLDivElement>(null);
  const userOpened = useRef(false);

  // Coming back from the portal (or the "Partner staff?" link at the top):
  // open the band, bring it into view and put the cursor in the email field
  useEffect(() => {
    if (!fromPortal) return;
    const t = requestAnimationFrame(() => {
      band.current?.scrollIntoView({ block: "start" });
      band.current
        ?.querySelector<HTMLInputElement>("#partner-form input")
        ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(t);
  }, [fromPortal]);
  useEffect(() => {
    if (open && userOpened.current)
      band.current
        ?.querySelector<HTMLInputElement>("#partner-form input")
        ?.focus();
  }, [open]);
  useEffect(() => {
    if (step !== "credentials") heading.current?.focus();
  }, [step]);
  useEffect(() => {
    if (errors.form) formError.current?.focus();
  }, [errors.form]);

  async function submitCredentials(e: FormEvent) {
    e.preventDefault();
    const next = {
      email: EMAIL.test(email.trim()) ? undefined : copy.errors.email,
      password: password ? undefined : copy.errors.password,
    };
    setErrors(next);
    if (next.email || next.password) return;
    await checkPassword(email, password);
  }

  /**
   * Step 1. Test build: "Use" on a test account calls this straight away with
   * the shared test password, then fills in the 2FA code, so testers go from
   * the list to the code step in one click and only press Sign in.
   */
  async function checkPassword(forEmail: string, withPassword: string, fillCode = false) {
    setBusy(true);
    const r = await startSignIn(forEmail, withPassword, undefined, "company");
    setBusy(false);
    const o = copy.outcomes;
    if (r.ok) {
      setChallenge(r.challenge);
      setPassword("");
      setCode(fillCode ? TEST_CREDENTIALS.code : "");
      setStep("code");
    } else if (r.reason === "invalid") {
      setErrors({
        form: `${o.invalid} ${r.attemptsLeft === 1 ? o.attemptsLeftOne : fill(o.attemptsLeft, { n: r.attemptsLeft })}`,
      });
    } else if (r.reason === "locked") {
      setErrors({ form: fill(o.locked, { time: formatTime(r.lockedUntil) }) });
    } else if (r.reason === "wrong_type") {
      setErrors({ form: o.individualEmail });
    } else {
      setErrors({ form: o.noAccess });
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) return setErrors({ code: copy.errors.code });
    setErrors({});
    setBusy(true);
    const r = await completeSignIn(challenge, digits);
    if (r.ok) {
      if (r.session) {
        writeSessionCookie(r.session);
        router.replace(safeNextPath(params.get("next")));
      } else {
        // Company still in review: the review status page, not the portal
        writeAccountCookie(r.accountSession);
        router.replace(accountHome(r.accountSession));
      }
      return; // stay busy while the next page loads
    }
    setBusy(false);
    if (r.reason === "wrong_code") {
      const o = copy.outcomes;
      setErrors({
        code: `${copy.wrongCode} ${r.attemptsLeft === 1 ? o.codeLeftOne : fill(o.codeLeft, { n: r.attemptsLeft })}`,
      });
      setCode("");
    } else {
      backToStart({ form: copy.outcomes.codeExpired });
    }
  }

  function backToStart(errs: typeof errors = {}) {
    setStep("credentials");
    setCode("");
    setChallenge("");
    setErrors(errs);
  }

  const p = copy.partner;

  return (
    <section
      id="partner"
      ref={band}
      aria-labelledby="partner-title"
      className="scroll-mt-20 pb-16 md:pb-20"
    >
      {/* Same card as the rider sign in above, with a still Buzz note beside it */}
      <div className="container-page grid items-start gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-7 rounded-panel border border-line bg-white p-5 min-[400px]:p-6 sm:p-12">
          <div>
            <h2
              id="partner-title"
              className="text-[clamp(30px,2.8vw,36px)] leading-[1.1] font-light tracking-[-0.025em]"
            >
              {p.title}
            </h2>
            <p className="mt-3 text-[17px] leading-normal text-ink-700">
              {p.body}
            </p>
            <p className="mt-2 text-[14px] text-ink-700">
              {copy.partnerSignup.prompt}{" "}
              <Link
                href={copy.partnerSignup.href}
                className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
              >
                {copy.partnerSignup.label}
              </Link>
            </p>
          </div>

          <div className="min-w-0">
            {!open ? (
              <Button
                size="lg"
                aria-expanded={false}
                aria-controls="partner-form"
                onClick={() => {
                  userOpened.current = true;
                  setOpen(true);
                }}
                className="w-full sm:w-auto sm:px-9"
              >
                {p.open}
              </Button>
            ) : (
              <div id="partner-form" className="flex flex-col gap-7">
                {notice && step === "credentials" && !errors.form && (
                  <p
                    role="status"
                    className="flex items-start gap-2 rounded-field bg-blue-50 px-4 py-3 text-[14px] leading-snug text-ink-900"
                  >
                    <Info
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-blue-600"
                      strokeWidth={1.8}
                    />
                    {notice}
                  </p>
                )}

                {step === "code" ? (
                  <form
                    onSubmit={submitCode}
                    noValidate
                    className="flex flex-col gap-7"
                  >
                    <div>
                      <h3
                        ref={heading}
                        tabIndex={-1}
                        className="text-h3 outline-none"
                      >
                        {copy.steps.codeTitle}
                      </h3>
                      <p className="mt-2 text-body text-ink-700">
                        {copy.steps.codeIntro}{" "}
                        <strong className="font-semibold break-words text-ink-900">
                          {email.trim()}
                        </strong>
                        .
                      </p>
                    </div>
                    <Field
                      label={copy.fields.code.label}
                      help={copy.fields.code.help}
                      error={errors.code}
                    >
                      {(props) => (
                        <Input
                          {...props}
                          value={code}
                          onChange={(e) =>
                            setCode(
                              e.target.value
                                .replace(/[^\d\s]/g, "")
                                .slice(0, 7),
                            )
                          }
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          className="code-text max-w-[13rem] text-[20px] tracking-[0.3em]"
                        />
                      )}
                    </Field>
                    <TestNote>{copy.steps.testCode}</TestNote>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <Button
                        type="submit"
                        size="lg"
                        loading={busy}
                        className="w-full sm:w-auto sm:px-9"
                      >
                        {copy.steps.verify}
                      </Button>
                      <button
                        type="button"
                        onClick={() => backToStart()}
                        className={textLink}
                      >
                        {copy.steps.back}
                      </button>
                    </div>
                    <p className="text-[14px] leading-snug text-ink-700">
                      {copy.steps.lostDevice}
                    </p>
                  </form>
                ) : (
                  <form
                    onSubmit={submitCredentials}
                    noValidate
                    className="flex flex-col gap-7"
                  >
                    {errors.form && (
                      <FormAlert alertRef={formError}>{errors.form}</FormAlert>
                    )}
                    <div className="flex flex-col gap-5">
                      <Field
                        label={copy.fields.email.label}
                        error={errors.email}
                      >
                        {(props) => (
                          <Input
                            {...props}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            spellCheck={false}
                            placeholder={copy.fields.email.placeholder}
                          />
                        )}
                      </Field>
                      <Field
                        label={copy.fields.password.label}
                        error={errors.password}
                      >
                        {(props) => (
                          <PasswordInput
                            {...props}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                          />
                        )}
                      </Field>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <Button
                        type="submit"
                        size="lg"
                        loading={busy}
                        className="w-full sm:w-auto sm:px-9"
                      >
                        {copy.steps.signIn}
                      </Button>
                      <ForgotPassword
                        label={copy.forgot.label}
                        body={copy.forgot.body}
                        actions={
                          <a
                            href={copy.forgot.contact.href}
                            className={textLink}
                          >
                            {copy.forgot.contact.label}
                          </a>
                        }
                      />
                    </div>
                    <TestAccountList
                      copy={copy}
                      actionLabel={copy.accounts.signIn}
                      rows={listTestAccounts()
                        .filter((a) => a.accountType === "company")
                        .map((a) => ({
                          key: a.email,
                          title: a.role
                            ? `${a.name}, ${ROLE_LABEL[a.role].toLowerCase()}`
                            : a.name,
                          detail: [a.email, a.company ?? "", a.landsOn],
                          useLabel: a.email,
                          onUse: () => {
                            backToStart();
                            setEmail(a.email);
                            void checkPassword(a.email, TEST_CREDENTIALS.password, true);
                          },
                        }))}
                    />
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* A still note: ties the card to the chat above without a second motion moment */}
        <div className="w-full max-w-[400px] lg:mt-12 lg:justify-self-end">
          <Bubble
            variant="system"
            sender={{ name: p.noteFrom, system: "buzz" }}
            onTint
          >
            {p.note}
          </Bubble>
        </div>
      </div>
    </section>
  );
}
