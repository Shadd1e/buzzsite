"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { TestNote } from "@/components/logistics/signin/shared";
import { AFRICAN_COUNTRIES, NIGERIAN_STATES, partnerApplyCopy as c, wizardCopy as w } from "@/content/onboarding";
import {
  checkPartnerStep,
  emptyPartnerDraft,
  formatDateTime,
  formatNaira,
  listOnboardingSlots,
  PortalError,
  quoteFromRates,
  submitPartnerApplication,
  type FieldErrors,
  type PartnerDraft,
} from "@/lib/data";
import type { ServiceType } from "@/lib/data/types";
import { MultiChips, SearchChips, SlotPicker } from "./Pickers";
import { DocumentsStep, ResumeBanner, ReviewSection, useDraft, Wizard } from "./Wizard";

const DRAFT_KEY = "buzz-partner-apply-draft-v1";
const err = (key?: string) => (key ? (c.errors as Record<string, string>)[key] : undefined);

/** Partner apply (DESIGN.md §10.1): guided, 7 steps, save and continue later */
export function PartnerApply() {
  const [draft, setDraft] = useState<PartnerDraft>(() => emptyPartnerDraft(c.documents));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const store = useDraft<PartnerDraft>(DRAFT_KEY, (d) => ({ ...d, documents: Object.fromEntries(Object.keys(d.documents).map((k) => [k, null])) }));

  useEffect(() => {
    void listOnboardingSlots("meeting").then(setSlots);
  }, []);

  const set = <K extends keyof PartnerDraft>(k: K, v: PartnerDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const text = (k: keyof PartnerDraft) => ({
    value: draft[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value as never),
  });

  async function next() {
    if (step < c.steps.length - 1) {
      const e = checkPartnerStep(step, draft);
      setErrors(e);
      if (Object.keys(e).length === 0) setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      setDone(await submitPartnerApplication(draft));
      store.clear();
      window.scrollTo({ top: 0 });
    } catch (e) {
      if (e instanceof PortalError && e.fields) {
        setErrors(e.fields);
        setStep((e as PortalError & { step?: number }).step ?? 0);
      }
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-convo border border-line bg-white p-6 sm:p-10">
        <CircleCheck aria-hidden="true" className="size-10 text-ok-700" strokeWidth={1.5} />
        <h2 className="mt-4 text-[clamp(26px,2.6vw,34px)] leading-tight font-light tracking-[-0.02em] text-ink-900">{c.success.title}</h2>
        <p className="mt-3 text-body text-ink-700">
          {c.success.body.replace("{name}", draft.contactName.split(" ")[0]).replace("{ref}", done.reference)}
        </p>
        <ol className="mt-5 flex list-decimal flex-col gap-2 pl-5 text-body text-ink-900 marker:text-ink-500">
          {c.success.next.map((n) => (
            <li key={n}>{n.replace("{meeting}", draft.slot ? formatDateTime(draft.slot) : "")}</li>
          ))}
        </ol>
        <div className="mt-6 flex flex-col items-start gap-4">
          <ButtonLink href={c.success.signIn.href} variant="outline">
            {c.success.signIn.label}
          </ButtonLink>
          <TestNote>{c.success.note}</TestNote>
        </div>
      </div>
    );
  }

  const quote = quoteFromRates({ perKm: Number(draft.perKm) || 0, buzzPercent: 3, modifiers: {} }, 20, []);

  return (
    <>
      {store.saved && (
        <ResumeBanner
          savedAt={store.saved.savedAt}
          onResume={() => {
            setDraft({ ...emptyPartnerDraft(c.documents), ...store.saved!.draft });
            setStep(store.saved!.step);
            store.dismiss();
          }}
          onRestart={store.clear}
        />
      )}
      <Wizard
        steps={c.steps}
        current={step}
        onBack={() => (setErrors({}), setStep(step - 1))}
        onNext={next}
        nextLabel={step === c.steps.length - 1 ? w.submit : w.next}
        busy={busy}
        hasErrors={Object.keys(errors).length > 0}
        onSaveLater={() => store.save(draft, step)}
      >
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={c.fields.legalName.label} help={c.fields.legalName.help} error={err(errors.legalName)} className="sm:col-span-2">
              {(p) => <Input {...p} {...text("legalName")} autoComplete="organization" />}
            </Field>
            <Field label={c.fields.cac.label} help={c.fields.cac.help} error={err(errors.cac)}>
              {(p) => <Input {...p} {...text("cac")} onChange={(e) => set("cac", e.target.value.toUpperCase())} className="code-text" spellCheck={false} />}
            </Field>
            <Field label={c.fields.address.label} error={err(errors.address)} className="sm:col-span-2">
              {(p) => <Input {...p} {...text("address")} autoComplete="street-address" />}
            </Field>
            <Field label={c.fields.contactName.label} error={err(errors.contactName)}>
              {(p) => <Input {...p} {...text("contactName")} autoComplete="name" />}
            </Field>
            <Field label={c.fields.contactPhone.label} error={err(errors.contactPhone)}>
              {(p) => <Input {...p} {...text("contactPhone")} type="tel" inputMode="tel" autoComplete="tel" placeholder={c.fields.contactPhone.placeholder} />}
            </Field>
            <Field label={c.fields.contactEmail.label} help={c.fields.contactEmail.help} error={err(errors.contactEmail)} className="sm:col-span-2">
              {(p) => <Input {...p} {...text("contactEmail")} type="email" autoComplete="email" spellCheck={false} placeholder={c.fields.contactEmail.placeholder} />}
            </Field>
            <div className="sm:col-span-2">
              <Checkbox
                label={c.fields.confirm.label}
                checked={draft.confirm}
                onCheckedChange={(v) => set("confirm", v === true)}
                invalid={!!errors.confirm}
                errorId={errors.confirm ? "confirm-error" : undefined}
              />
              {errors.confirm && (
                <p id="confirm-error" className="text-[14px] text-alert-700">
                  {err(errors.confirm)}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-7">
            <MultiChips
              name="services"
              legend={c.fields.services.label}
              options={c.services}
              value={draft.services}
              onChange={(v) => set("services", v as ServiceType[])}
              error={err(errors.services)}
            />
            <SearchChips name="states" legend={c.fields.states.label} help={c.fields.states.help} options={NIGERIAN_STATES} value={draft.states} onChange={(v) => set("states", v)} error={err(errors.states)} />
            {draft.services.includes("international") && (
              <SearchChips
                name="countries"
                legend={c.fields.countries.label}
                help={c.fields.countries.help}
                options={AFRICAN_COUNTRIES}
                value={draft.countries}
                onChange={(v) => set("countries", v)}
                error={err(errors.countries)}
              />
            )}
            <MultiChips name="vehicles" legend={c.fields.vehicles.label} options={c.vehicles.map((v) => ({ value: v, label: v }))} value={draft.vehicles} onChange={(v) => set("vehicles", v)} error={err(errors.vehicles)} />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {(["riders", "vehicleCount", "hubs", "years"] as const).map((k) => (
              <Field key={k} label={c.fields[k].label} error={err(errors[k])}>
                {(p) => <Input {...p} {...text(k)} inputMode="numeric" className="tabular-nums" />}
              </Field>
            ))}
            <Field label={c.fields.tracking.label} help={c.fields.tracking.help} className="sm:col-span-2">
              {(p) => <Input {...p} {...text("tracking")} />}
            </Field>
          </div>
        )}

        {step === 3 && (
          <DocumentsStep
            documents={c.documents}
            files={draft.documents}
            onFile={(name, f) => setDraft((d) => ({ ...d, documents: { ...d.documents, [name]: f } }))}
            errors={errors}
            errorText={c.errors.document}
          />
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <Field label={c.fields.perKm.label} error={err(errors.perKm)}>
              {(p) => <Input {...p} {...text("perKm")} inputMode="numeric" className="max-w-[12rem] tabular-nums" />}
            </Field>
            <p className="text-ui text-ink-700">{c.buzzAdds}</p>
            {Number(draft.perKm) >= 50 && (
              <p className="rounded-field bg-mist px-4 py-3 text-ui text-ink-900">
                {c.example.replace("{earn}", formatNaira(quote.earnings)).replace("{pays}", formatNaira(quote.buyerPays))}
              </p>
            )}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-[14px] font-semibold text-ink-900">{c.fields.modifiers.label}</legend>
              <p className="-mt-1 text-[13px] text-ink-500">{c.fields.modifiers.help}</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {c.modifiers.map((m) => (
                  <Field key={m.key} label={`${m.label} (%)`} error={err(errors[`mod:${m.key}`])}>
                    {(p) => (
                      <Input
                        {...p}
                        value={draft.modifiers[m.key]}
                        onChange={(e) => setDraft((d) => ({ ...d, modifiers: { ...d.modifiers, [m.key]: e.target.value } }))}
                        inputMode="numeric"
                        className="tabular-nums"
                      />
                    )}
                  </Field>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <SlotPicker label="meeting" slots={slots} value={draft.slot} onChange={(s) => set("slot", s)} error={err(errors.slot)} />
            {draft.slot && <p className="text-ui font-semibold text-ink-900">{w.booked.replace("{when}", formatDateTime(draft.slot))}</p>}
            <p className="text-ui text-ink-700">{c.meetingLength}</p>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-4">
            <ReviewSection
              title={c.steps[0].name}
              onEdit={() => setStep(0)}
              rows={[
                [c.fields.legalName.label, draft.legalName],
                [c.fields.cac.label, draft.cac],
                [c.fields.address.label, draft.address],
                [c.fields.contactName.label, draft.contactName],
                [c.fields.contactEmail.label, draft.contactEmail],
                [c.fields.contactPhone.label, draft.contactPhone],
              ]}
            />
            <ReviewSection
              title={c.steps[1].name}
              onEdit={() => setStep(1)}
              rows={[
                [c.fields.services.label, draft.services.map((s) => c.services.find((x) => x.value === s)?.label).join(", ")],
                [c.fields.states.label, draft.states.join(", ")],
                ...(draft.services.includes("international") ? ([[c.fields.countries.label, draft.countries.join(", ")]] as Array<[string, string]>) : []),
                [c.fields.vehicles.label, draft.vehicles.join(", ")],
              ]}
            />
            <ReviewSection
              title={c.steps[2].name}
              onEdit={() => setStep(2)}
              rows={[
                [c.fields.riders.label, draft.riders],
                [c.fields.vehicleCount.label, draft.vehicleCount],
                [c.fields.hubs.label, draft.hubs],
                [c.fields.years.label, draft.years],
                [c.fields.tracking.label, draft.tracking],
              ]}
            />
            <ReviewSection title={c.steps[3].name} onEdit={() => setStep(3)} rows={c.documents.map((d) => [d, draft.documents[d]?.fileName ?? ""] as [string, string])} />
            <ReviewSection
              title={c.steps[4].name}
              onEdit={() => setStep(4)}
              rows={[
                [c.fields.perKm.label, draft.perKm ? formatNaira(Number(draft.perKm)) : ""],
                ...c.modifiers.map((m) => [m.label, `+${draft.modifiers[m.key] || 0}%`] as [string, string]),
              ]}
            />
            <ReviewSection title={c.steps[5].name} onEdit={() => setStep(5)} rows={[["Video call", draft.slot ? formatDateTime(draft.slot) : ""]]} />
            <TestNote>{w.test}</TestNote>
          </div>
        )}
      </Wizard>

      <p className="mt-6 text-[14px] text-ink-700">
        {c.riderNote.before}{" "}
        <Link href={c.riderNote.href} className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4">
          {c.riderNote.label}
        </Link>
      </p>
    </>
  );
}
