"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Smartphone, UserRound } from "lucide-react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Bubble } from "@/components/chat";
import { usePortalPersistence } from "@/components/portal/session";
import {
  cancelBuzzIdSignIn,
  companyRiderSignIn,
  confirmBuzzIdSignIn,
  individualRiderSignIn,
  listTestRiders,
  normalBuzzId,
  startBuzzIdSignIn,
  TEST_CREDENTIALS,
  type RiderSignedIn,
  type RiderSignInResult,
} from "@/lib/data";
import { formatTime } from "@/lib/data/format";
import { cn } from "@/lib/cn";
import { writeAccountCookie } from "@/components/account/session";
import { accountHome } from "@/lib/portal-access";
import type { AccountSession } from "@/lib/data/types";
import { Info } from "lucide-react";
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
 * Rider sign in (DESIGN.md §10.1). The two kinds of rider are a segmented
 * control: "I ride with a partner" (company code + rider code) or "I ride on
 * my own" (rider code + password, or "Sign in with Buzz ID", confirmed in the
 * Buzz app). The choice lives in ?rider= so links work. A successful sign
 * in goes to the rider area, or the review status page while pending.
 * Rider dashboards are a later build step, so a successful sign in shows who
 * signed in and what comes next.
 */
type Kind = RiderSignedIn["kind"];
type Method = "code" | "buzz";
type Errors = {
  companyCode?: string;
  riderCode?: string;
  password?: string;
  buzzId?: string;
  form?: string;
};
interface Waiting {
  requestId: string;
  buzzId: string;
  expiresAt: number;
}

const KINDS: Kind[] = ["company_rider", "individual"];

export function RiderSignIn({ copy }: { copy: SignInCopy }) {
  usePortalPersistence();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [kind, setKind] = useState<Kind>(
    params.get("rider") === "individual" ? "individual" : "company_rider",
  );
  const [method, setMethod] = useState<Method>("code");
  const [companyCode, setCompanyCode] = useState("");
  const [riderCode, setRiderCode] = useState("");
  const [password, setPassword] = useState("");
  const [buzzId, setBuzzId] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [switchTo, setSwitchTo] = useState<Kind | null>(null);
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState<Waiting | null>(null);
  const [expired, setExpired] = useState(false);
  const formError = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (errors.form) formError.current?.focus();
  }, [errors.form]);
  useEffect(() => {
    if (waiting) heading.current?.focus();
  }, [waiting]);

  // Back from the rider area or review page (signed out, or timed out)
  const reason = params.get("reason");
  const notice =
    reason && reason in copy.riderNotices
      ? copy.riderNotices[reason as keyof SignInCopy["riderNotices"]]
      : null;

  /** Signed in: keep the button busy while the rider area or review page loads */
  function goHome(session: AccountSession) {
    writeAccountCookie(session);
    setBusy(true);
    router.replace(accountHome(session));
  }

  function chooseKind(next: Kind) {
    setKind(next);
    setErrors({});
    setSwitchTo(null);
    const q = new URLSearchParams(params.toString());
    q.set("rider", next === "individual" ? "individual" : "company");
    q.delete("reason"); // the "signed out" note is done once they carry on
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  }

  function showResult(r: RiderSignInResult, individual: boolean) {
    if (r.ok) {
      goHome(r.session);
      return;
    }
    const o = copy.riderOutcomes;
    if (r.reason === "invalid") {
      const left =
        r.attemptsLeft === 1
          ? o.attemptsLeftOne
          : fill(o.attemptsLeft, { n: r.attemptsLeft });
      setErrors({
        form: `${individual ? o.invalidIndividual : o.invalid} ${left}`,
      });
    } else if (r.reason === "locked") {
      setErrors({ form: fill(o.locked, { time: formatTime(r.lockedUntil) }) });
    } else if (r.reason === "not_verified") {
      setErrors({ form: o.notVerified });
    } else if (r.reason === "inactive") {
      setErrors({ form: o.inactive });
    } else {
      setErrors({ form: o.otherKind[r.kind] });
      setSwitchTo(r.kind);
    }
  }

  async function submitCompany(e: FormEvent) {
    e.preventDefault();
    const c = copy.company.errors;
    const next: Errors = {
      companyCode: companyCode.trim() ? undefined : c.companyCode,
      riderCode: riderCode.trim() ? undefined : c.riderCode,
    };
    setErrors(next);
    setSwitchTo(null);
    if (next.companyCode || next.riderCode) return;
    setBusy(true);
    const r = await companyRiderSignIn(companyCode, riderCode);
    setBusy(false);
    showResult(r, false);
  }

  async function submitIndividual(e: FormEvent) {
    e.preventDefault();
    const c = copy.individual.errors;
    const next: Errors = {
      riderCode: riderCode.trim() ? undefined : c.riderCode,
      password: password ? undefined : c.password,
    };
    setErrors(next);
    setSwitchTo(null);
    if (next.riderCode || next.password) return;
    setBusy(true);
    const r = await individualRiderSignIn(riderCode, password);
    setBusy(false);
    showResult(r, true);
  }

  async function submitBuzz(e?: FormEvent) {
    e?.preventDefault();
    setErrors({});
    setBusy(true);
    const r = await startBuzzIdSignIn(buzzId);
    setBusy(false);
    if (!r.ok) return setErrors({ buzzId: copy.individual.buzz.format });
    setExpired(false);
    setWaiting({
      requestId: r.requestId,
      buzzId: normalBuzzId(buzzId),
      expiresAt: Date.parse(r.expiresAt),
    });
  }

  async function simulateConfirm() {
    if (!waiting) return;
    setBusy(true);
    const r = await confirmBuzzIdSignIn(waiting.requestId);
    setBusy(false);
    if (r.ok) {
      goHome(r.session);
    } else if (r.reason === "expired") {
      setExpired(true);
    } else {
      setErrors({ form: copy.individual.buzz.noAccount });
    }
  }

  function cancelWaiting() {
    if (waiting) cancelBuzzIdSignIn(waiting.requestId);
    setWaiting(null);
    setExpired(false);
    setErrors({});
  }

  if (waiting) {
    return (
      <BuzzWaiting
        copy={copy}
        waiting={waiting}
        expired={expired}
        onExpire={() => setExpired(true)}
        busy={busy}
        error={errors.form}
        errorRef={formError}
        headingRef={heading}
        onSimulate={simulateConfirm}
        onResend={() => submitBuzz()}
        onCancel={cancelWaiting}
      />
    );
  }

  const alert = errors.form && (
    <FormAlert
      alertRef={formError}
      action={
        switchTo
          ? {
              label: copy.riderOutcomes.switchTo[switchTo],
              onClick: () => chooseKind(switchTo),
            }
          : undefined
      }
    >
      {errors.form}
    </FormAlert>
  );

  const toMethod = (m: Method) => {
    setMethod(m);
    setErrors({});
    setSwitchTo(null);
  };

  return (
    <div className="flex flex-col gap-7">
      {notice && (
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
      <KindSwitch copy={copy} kind={kind} onChange={chooseKind} />

      {kind === "company_rider" ? (
        <form
          onSubmit={submitCompany}
          noValidate
          className="flex flex-col gap-7"
        >
          {alert}
          <div className="flex flex-col gap-5">
            <Field
              label={copy.company.companyCode.label}
              help={copy.company.companyCode.help}
              error={errors.companyCode}
            >
              {(props) => (
                <Input
                  {...props}
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  autoComplete="organization"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="code-text"
                />
              )}
            </Field>
            <Field
              label={copy.company.riderCode.label}
              help={copy.company.riderCode.help}
              error={errors.riderCode}
            >
              {(props) => (
                <Input
                  {...props}
                  value={riderCode}
                  onChange={(e) => setRiderCode(e.target.value.toUpperCase())}
                  autoComplete="username"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="code-text"
                />
              )}
            </Field>
          </div>
          <Button
            type="submit"
            size="lg"
            loading={busy}
            className="w-full sm:w-auto sm:self-start sm:px-9"
          >
            {copy.company.submit}
          </Button>
          <p className="text-[14px] leading-snug text-ink-700">
            {copy.company.intro}
          </p>
          <RiderTestAccounts
            copy={copy}
            kind="company_rider"
            onUse={(t) => {
              setErrors({});
              setCompanyCode(t.companyCode ?? "");
              setRiderCode(t.riderCode ?? "");
            }}
          />
        </form>
      ) : method === "code" ? (
        <div className="flex flex-col gap-7">
          <form
            onSubmit={submitIndividual}
            noValidate
            className="flex flex-col gap-7"
          >
            {alert}
            <div className="flex flex-col gap-5">
              <Field
                label={copy.individual.riderCode.label}
                help={copy.individual.riderCode.help}
                error={errors.riderCode}
              >
                {(props) => (
                  <Input
                    {...props}
                    value={riderCode}
                    onChange={(e) => setRiderCode(e.target.value.toUpperCase())}
                    autoComplete="username"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="code-text"
                  />
                )}
              </Field>
              <Field
                label={copy.individual.password.label}
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
                {copy.individual.submit}
              </Button>
              <ForgotPassword
                label={copy.individual.forgot.label}
                body={copy.individual.forgot.body}
                actions={
                  <a
                    href={copy.individual.forgot.contact.href}
                    className={textLink}
                  >
                    {copy.individual.forgot.contact.label}
                  </a>
                }
              />
            </div>
          </form>

          <div
            aria-hidden="true"
            className="flex items-center gap-4 text-[13px] text-ink-500"
          >
            <span className="h-px flex-1 bg-line" />
            {copy.individual.or}
            <span className="h-px flex-1 bg-line" />
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => toMethod("buzz")}
            icon={
              <UserRound
                aria-hidden="true"
                className="size-5"
                strokeWidth={1.8}
              />
            }
            className="w-full border-ink-900! hover:bg-mist"
          >
            {copy.individual.buzzButton}
          </Button>
          <p className="text-[14px] leading-snug text-ink-700">
            {copy.individual.pendingHint}
          </p>
          <IndividualTestAccounts
            copy={copy}
            method={method}
            onUseCode={(c) => (setRiderCode(c), setPassword(TEST_CREDENTIALS.password), setErrors({}))}
            onUseBuzz={(id) => (toMethod("buzz"), setBuzzId(id))}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          <form
            onSubmit={submitBuzz}
            noValidate
            className="flex flex-col gap-7"
          >
            <Field
              label={copy.individual.buzz.label}
              help={copy.individual.buzz.help}
              error={errors.buzzId}
            >
              {(props) => (
                <Input
                  {...props}
                  value={buzzId}
                  onChange={(e) => setBuzzId(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder={copy.individual.buzz.placeholder}
                  autoFocus
                />
              )}
            </Field>
            <Button
              type="submit"
              size="lg"
              loading={busy}
              icon={
                <Smartphone
                  aria-hidden="true"
                  className="size-[18px]"
                  strokeWidth={1.8}
                />
              }
              className="w-full"
            >
              {copy.individual.buzz.submit}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => toMethod("code")}
            className={cn(textLink, "self-start")}
          >
            {copy.individual.useCode}
          </button>
          <IndividualTestAccounts
            copy={copy}
            method={method}
            onUseCode={(c) => (
              toMethod("code"),
              setRiderCode(c),
              setPassword(TEST_CREDENTIALS.password)
            )}
            onUseBuzz={(id) => setBuzzId(id)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * The two kinds of rider as a segmented control: a mist track with the chosen
 * side raised in white. Real radios underneath, so arrow keys work.
 */
function KindSwitch({
  copy,
  kind,
  onChange,
}: {
  copy: SignInCopy;
  kind: Kind;
  onChange: (k: Kind) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{copy.riderKinds.legend}</legend>
      <div className="grid grid-cols-2 gap-1 rounded-field bg-mist p-1">
        {KINDS.map((k) => {
          const on = k === kind;
          return (
            <label
              key={k}
              className={cn(
                "flex min-h-12 cursor-pointer items-center justify-center rounded-[11px] px-2 text-center text-[14px] leading-tight min-[400px]:text-[15px] min-[400px]:whitespace-nowrap sm:px-3 transition-[background-color,color,box-shadow] duration-(--dur-1) ease-out",
                "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sky-400",
                on
                  ? "bg-white font-semibold text-ink-900 shadow-lift"
                  : "font-medium text-ink-700 hover:text-ink-900",
              )}
            >
              <input
                type="radio"
                name="rider-kind"
                value={k}
                checked={on}
                onChange={() => onChange(k)}
                className="sr-only"
              />
              {
                copy.riderKinds[
                  k === "company_rider" ? "company" : "individual"
                ]
              }
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Waiting for the rider to confirm in the Buzz app. */
function BuzzWaiting({
  copy,
  waiting,
  expired,
  onExpire,
  busy,
  error,
  errorRef,
  headingRef,
  onSimulate,
  onResend,
  onCancel,
}: {
  copy: SignInCopy;
  waiting: Waiting;
  expired: boolean;
  onExpire: () => void;
  busy: boolean;
  error?: string;
  errorRef: RefObject<HTMLDivElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onSimulate: () => void;
  onResend: () => void;
  onCancel: () => void;
}) {
  const b = copy.individual.buzz;
  const [before, after = ""] = b.waitingBody.split("{id}");
  const expire = useRef(onExpire);
  useEffect(() => {
    expire.current = onExpire;
  });
  const [left, setLeft] = useState(() =>
    Math.max(0, Math.round((waiting.expiresAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.max(
        0,
        Math.round((waiting.expiresAt - Date.now()) / 1000),
      );
      setLeft(s);
      if (s === 0) {
        clearInterval(t);
        expire.current();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [waiting.expiresAt]);

  const time = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div className="flex max-w-[36em] flex-col items-start gap-6">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-[clamp(30px,3.4vw,44px)] leading-[1.1] font-light tracking-[-0.025em] outline-none"
        >
          {b.waitingTitle}
        </h2>
        <p className="mt-3 text-body text-ink-700">
          {before}
          <strong className="font-semibold break-words text-ink-900">
            {waiting.buzzId}
          </strong>
          {after}
        </p>
      </div>

      {/* What the rider sees in the app, drawn as Buzz bubbles (illustrative, not interactive) */}
      <figure
        aria-label={b.prompt}
        className="flex w-full max-w-[24em] flex-col gap-2"
      >
        <Bubble
          variant="system"
          sender={{ name: b.promptFrom, system: "buzz" }}
        >
          {b.prompt}
        </Bubble>
        <div aria-hidden="true" className="flex gap-2 pl-1">
          <span className="rounded-full bg-blue-600 px-4 py-2 text-[14px] font-semibold text-white">
            {b.promptYes}
          </span>
          <span className="rounded-full border border-line-strong bg-white px-4 py-2 text-[14px] font-semibold text-ink-900">
            {b.promptNo}
          </span>
        </div>
      </figure>

      {error && <FormAlert alertRef={errorRef}>{error}</FormAlert>}

      {expired ? (
        <div className="flex flex-col items-start gap-3">
          <p role="status" className="text-body text-ink-700">
            {b.expired}
          </p>
          <Button size="lg" loading={busy} onClick={onResend}>
            {b.resend}
          </Button>
        </div>
      ) : (
        <>
          <p role="timer" aria-live="off" className="text-[14px] text-ink-700">
            {fill(b.expiresIn, { time })}
          </p>
          <div className="flex flex-col items-start gap-2">
            <Button variant="outline" loading={busy} onClick={onSimulate}>
              {b.simulate}
            </Button>
            <TestNote>{TEST_HINT}</TestNote>
          </div>
        </>
      )}

      <button type="button" onClick={onCancel} className={textLink}>
        {b.cancel}
      </button>
    </div>
  );
}

const TEST_HINT =
  "Test build: there's no Buzz app to confirm in yet, so this button stands in for it.";

function RiderTestAccounts({
  copy,
  kind,
  onUse,
}: {
  copy: SignInCopy;
  kind: Kind;
  onUse: (t: ReturnType<typeof listTestRiders>[number]) => void;
}) {
  const rows = listTestRiders()
    .filter((t) => t.kind === kind)
    .map((t) => {
      const codes = [t.companyCode, t.riderCode, t.buzzId]
        .filter(Boolean)
        .join(" + ");
      const note =
        t.status === "active" ? "" : ` (${t.status.replace(/_/g, " ")})`;
      return {
        key: t.name,
        title: t.name + note,
        detail: kind === "individual" && t.riderCode ? [codes, `Password ${TEST_CREDENTIALS.password}`, t.landsOn] : [codes, t.landsOn],
        useLabel: t.name,
        onUse: () => onUse(t),
      };
    });
  return <TestAccountList copy={copy} rows={rows} />;
}

/** Individual test riders: fill the rider code, or the Buzz ID when that's the open method. */
function IndividualTestAccounts({
  copy,
  method,
  onUseCode,
  onUseBuzz,
}: {
  copy: SignInCopy;
  method: Method;
  onUseCode: (riderCode: string) => void;
  onUseBuzz: (buzzId: string) => void;
}) {
  return (
    <RiderTestAccounts
      copy={copy}
      kind="individual"
      onUse={(t) => {
        if (method === "buzz" || !t.riderCode) onUseBuzz(t.buzzId ?? "");
        else onUseCode(t.riderCode);
      }}
    />
  );
}
