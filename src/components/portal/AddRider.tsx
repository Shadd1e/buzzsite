"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CircleCheck, Clock, Plus } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Code } from "@/components/Code";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { StepProgress } from "@/components/StepProgress";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { addVerificationCheck, getVerificationChecklist, PortalError, registerRider, VEHICLES } from "@/lib/data";
import { normaliseNigerianPhone } from "@/lib/data/portal";
import type { Rider } from "@/lib/data/types";
import { usePortal, useLoad } from "./session";

const STEPS = ["Rider details", "Your checks", "Confirm"];

/**
 * Add rider (DESIGN.md §10.2): details → the company's own verification
 * checklist → "We have verified this rider" → rider code with instructions
 * to send. Buzz only needs the company's confirmation (PRODUCT.md).
 */
export function AddRider() {
  const { session, company, can } = usePortal();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Rider | null>(null);
  const [newCheck, setNewCheck] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const checklist = useLoad(() => getVerificationChecklist(session), [session.staffId]);
  const checks = checklist.data ?? [];
  const allChecked = checks.length > 0 && checks.every((c) => done[c]);
  // Unticking a check after confirming withdraws the confirmation
  const confirmedNow = confirmed && allChecked;

  useEffect(() => {
    heading.current?.focus();
  }, [step, created]);

  function nextFromDetails(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const n = name.trim().replace(/\s+/g, " ");
    if (n.length < 3 || !n.includes(" ")) next.name = "Enter the rider's first and last name, as on their ID.";
    if (!normaliseNigerianPhone(phone)) next.phone = "Enter a Nigerian mobile number, like 0800 000 1234 or +234 800 000 1234.";
    if (!vehicle) next.vehicle = "Choose the vehicle they'll ride or drive.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(1);
  }

  async function addCheck() {
    try {
      await addVerificationCheck(session, newCheck);
      setNewCheck("");
      setErrors({});
      checklist.reload();
      toast({ title: "Check added", description: "New riders will need it too." });
    } catch (e) {
      if (e instanceof PortalError) setErrors({ newCheck: e.fields?.label ?? e.message });
    }
  }

  async function submit(asPending: boolean) {
    setBusy(true);
    try {
      const rider = await registerRider(session, {
        name,
        phone,
        vehicle,
        checks: checks.map((label) => ({ label, done: !!done[label] })),
        confirmed: asPending ? false : confirmedNow,
      });
      setCreated(rider);
      toast({ title: rider.status === "active" ? "Rider added" : "Rider saved as pending" });
    } catch (e) {
      if (e instanceof PortalError && e.fields) {
        setErrors(e.fields);
        setStep(0);
      } else {
        toast({ tone: "error", title: "The rider wasn't saved", description: "Check your connection, then try again." });
      }
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    const active = created.status === "active";
    return (
      <div className="mx-auto max-w-[640px]">
        <div className="rounded-field border border-line bg-white p-6 sm:p-8" role="status">
          {active ? (
            <CircleCheck aria-hidden="true" className="size-8 text-ok-600" strokeWidth={1.6} />
          ) : (
            <Clock aria-hidden="true" className="size-8 text-warn-700" strokeWidth={1.6} />
          )}
          <h1 ref={heading} tabIndex={-1} className="mt-3 text-page-title text-ink-900 outline-none">
            {active ? `${created.name} is ready to ride` : `${created.name} is waiting for verification`}
          </h1>
          <p className="mt-2 text-ui text-ink-700">
            {active
              ? "Send them these two codes and the steps below. Their rider view and scanner appear after they sign in."
              : "Their rider code is reserved, but it won't work in the app until you finish your checks and confirm them on their profile."}
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-label text-ink-500">Company code</dt>
              <dd className="mt-1.5">
                <Code value={company.companyCode} label="Company code" />
              </dd>
            </div>
            <div>
              <dt className="text-label text-ink-500">Rider code</dt>
              <dd className="mt-1.5">
                <Code value={created.riderCode} label="Rider code" />
              </dd>
            </div>
          </dl>

          {active && (
            <div className="mt-6 rounded-field bg-blue-50 px-5 py-4">
              <h2 className="text-[15px] font-semibold text-ink-900">What to send the rider</h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-ui text-ink-700">
                <li>Open Buzz and go to Me.</li>
                <li>Scroll to the bottom and tap Logistics partners.</li>
                <li>
                  Enter company code <span className="code-text">{company.companyCode}</span> and rider code{" "}
                  <span className="code-text">{created.riderCode}</span>.
                </li>
              </ol>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <ButtonLink href={`/logistics/portal/riders/${created.id}`}>Open rider profile</ButtonLink>
            <Button
              variant="outline"
              onClick={() => {
                setCreated(null);
                setStep(0);
                setName("");
                setPhone("");
                setVehicle("");
                setDone({});
                setConfirmed(false);
              }}
            >
              Add another rider
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <p className="mb-3 text-meta">
        <Link href="/logistics/portal/riders" className="inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
          Riders
        </Link>
      </p>
      <div className="rounded-field border border-line bg-white p-6 sm:p-8">
        <StepProgress steps={STEPS} current={step} />

        {step === 0 && (
          <form onSubmit={nextFromDetails} noValidate className="mt-8 flex flex-col gap-5">
            <div>
              <h1 ref={heading} tabIndex={-1} className="text-page-title text-ink-900 outline-none">
                Add rider
              </h1>
              <p className="mt-1 text-ui text-ink-700">
                Riders can&apos;t sign themselves up. You register them here and they get a rider code for the Buzz app.
              </p>
            </div>
            <Field label="Full name" help="As it appears on their ID." error={errors.name}>
              {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />}
            </Field>
            <Field label="Mobile number" help="Used by your dispatch team. Buyers never see it." error={errors.phone}>
              {(p) => (
                <Input {...p} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0800 000 1234" autoComplete="off" />
              )}
            </Field>
            <Field label="Vehicle" error={errors.vehicle}>
              {(p) => (
                <Select {...p} value={vehicle} onValueChange={setVehicle} options={VEHICLES.map((v) => ({ value: v, label: v }))} placeholder="Choose a vehicle" />
              )}
            </Field>
            <div className="flex justify-end">
              <Button type="submit">Continue</Button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="mt-8 flex flex-col gap-5">
            <div>
              <h1 ref={heading} tabIndex={-1} className="text-page-title text-ink-900 outline-none">
                Your verification checks
              </h1>
              <p className="mt-1 text-ui text-ink-700">
                {company.name} sets its own checks. Tick the ones you&apos;ve done for {name.trim().split(" ")[0]}. You can save and
                finish later.
              </p>
            </div>
            <fieldset className="rounded-field border border-line px-4 py-2">
              <legend className="sr-only">Verification checks</legend>
              {checklist.state === "loading" ? (
                <div className="flex flex-col gap-3 py-3">
                  <Skeleton className="w-48" />
                  <Skeleton className="w-40" />
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {checks.map((c) => (
                    <Checkbox key={c} label={c} checked={!!done[c]} onCheckedChange={(v) => setDone((d) => ({ ...d, [c]: v === true }))} />
                  ))}
                </div>
              )}
            </fieldset>
            {can("edit_checklist") && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <Field label="Add a check for your company" error={errors.newCheck} className="flex-1">
                  {(p) => <Input {...p} value={newCheck} onChange={(e) => setNewCheck(e.target.value)} placeholder="For example, Address visited" />}
                </Field>
                <Button variant="outline" onClick={addCheck} className="sm:mt-[30px]" icon={<Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
                  Add check
                </Button>
              </div>
            )}
            <div className="flex flex-wrap justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 flex flex-col gap-5">
            <div>
              <h1 ref={heading} tabIndex={-1} className="text-page-title text-ink-900 outline-none">
                Confirm and get the rider code
              </h1>
              <p className="mt-1 text-ui text-ink-700">Buzz relies on your company&apos;s confirmation. It&apos;s recorded with your name.</p>
            </div>
            <dl className="divide-y divide-line rounded-field border border-line text-ui">
              {[
                ["Name", name.trim()],
                ["Mobile number", normaliseNigerianPhone(phone) ?? phone],
                ["Vehicle", vehicle],
                ["Checks done", `${checks.filter((c) => done[c]).length} of ${checks.length}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="text-right text-ink-900 tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <Checkbox
              label="We have verified this rider"
              description={allChecked ? "Every check above is done." : "Finish every check first, or save them as pending."}
              checked={confirmedNow}
              disabled={!allChecked}
              onCheckedChange={(v) => setConfirmed(v === true)}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" loading={busy && !confirmedNow} disabled={busy} onClick={() => submit(true)}>
                  Save as pending
                </Button>
                <Button loading={busy && confirmedNow} disabled={!confirmedNow || busy} onClick={() => submit(false)}>
                  Add rider
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
