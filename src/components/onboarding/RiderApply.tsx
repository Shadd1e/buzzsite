"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CircleCheck, Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { TestNote } from "@/components/logistics/signin/shared";
import { riderApplyCopy as c, wizardCopy as w } from "@/content/onboarding";
import {
  checkRiderStep,
  emptyRiderDraft,
  formatDateTime,
  formatNaira,
  listOnboardingSlots,
  PortalError,
  quoteFromRates,
  submitRiderApplication,
  type FieldErrors,
  type RiderDraft,
} from "@/lib/data";
import { SlotPicker } from "./Pickers";
import { DocumentsStep, ResumeBanner, ReviewSection, UploadField, useDraft, Wizard } from "./Wizard";

const DRAFT_KEY = "buzz-rider-apply-draft-v1";
const err = (key?: string) => (key ? (c.errors as Record<string, string>)[key] : undefined);
const fresh = () => emptyRiderDraft(c.documents, c.photos);

/**
 * Individual rider sign up (DESIGN.md §10.1): guided, 6 steps. Company riders
 * don't sign up here: the first thing on the page tells them to ask their
 * company, which registers them in the partner portal.
 */
export function RiderApply() {
  const [draft, setDraft] = useState<RiderDraft>(fresh);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const store = useDraft<RiderDraft>(DRAFT_KEY, (d) => ({
    ...d,
    papers: d.papers.map((p) => ({ ...p, file: null })),
    photos: Object.fromEntries(Object.keys(d.photos).map((k) => [k, null])),
    documents: Object.fromEntries(Object.keys(d.documents).map((k) => [k, null])),
  }));

  useEffect(() => {
    void listOnboardingSlots("inspection").then(setSlots);
  }, []);

  const set = <K extends keyof RiderDraft>(k: K, v: RiderDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const text = (k: keyof RiderDraft) => ({
    value: draft[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value as never),
  });

  async function next() {
    if (step < c.steps.length - 1) {
      const e = checkRiderStep(step, draft);
      setErrors(e);
      if (Object.keys(e).length === 0) setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      setDone(await submitRiderApplication(draft));
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
        <p className="mt-3 text-body text-ink-700">{c.success.body.replace("{name}", draft.fullName.split(" ")[0]).replace("{ref}", done.reference)}</p>
        <ol className="mt-5 flex list-decimal flex-col gap-2 pl-5 text-body text-ink-900 marker:text-ink-500">
          {c.success.next.map((n) => (
            <li key={n}>{n.replace("{inspection}", draft.slot ? formatDateTime(draft.slot) : "").replace("{address}", c.inspectionAddress)}</li>
          ))}
        </ol>
        {draft.buzzId.trim() && <p className="mt-4 text-body text-ink-700">{c.success.review}</p>}
        <div className="mt-6 flex flex-col items-start gap-4">
          <ButtonLink href={c.success.signIn.href} variant="outline">
            {c.success.signIn.label}
          </ButtonLink>
          <TestNote>{c.success.note}</TestNote>
        </div>
      </div>
    );
  }

  const quote = quoteFromRates({ perKm: Number(draft.perKm) || 0, buzzPercent: 3, modifiers: {} }, 10, []);
  const idOptions = c.idTypes;

  return (
    <>
      {step === 0 && (
        <aside aria-label={c.companyNote.title} className="mb-6 flex gap-3 rounded-field border border-line bg-white px-5 py-4">
          <Building2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-600" strokeWidth={1.7} />
          <div>
            <p className="text-[15px] font-semibold text-ink-900">{c.companyNote.title}</p>
            <p className="mt-1 text-[14px] text-ink-700">{c.companyNote.body}</p>
            <Link href={c.companyNote.link.href} className="mt-1 inline-flex min-h-11 items-center text-[14px] font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4">
              {c.companyNote.link.label}
            </Link>
          </div>
        </aside>
      )}

      {store.saved && (
        <ResumeBanner
          savedAt={store.saved.savedAt}
          onResume={() => {
            setDraft({ ...fresh(), ...store.saved!.draft });
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
            <Field label={c.fields.fullName.label} help={c.fields.fullName.help} error={err(errors.fullName)} className="sm:col-span-2">
              {(p) => <Input {...p} {...text("fullName")} autoComplete="name" />}
            </Field>
            <Field label={c.fields.phone.label} error={err(errors.phone)}>
              {(p) => <Input {...p} {...text("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder={c.fields.phone.placeholder} />}
            </Field>
            <Field label={c.fields.email.label} help={c.fields.email.help} error={err(errors.email)}>
              {(p) => <Input {...p} {...text("email")} type="email" autoComplete="email" spellCheck={false} placeholder={c.fields.email.placeholder} />}
            </Field>
            <Field label={c.fields.address.label} error={err(errors.address)} className="sm:col-span-2">
              {(p) => <Input {...p} {...text("address")} autoComplete="street-address" />}
            </Field>
            <Field label={c.fields.idType.label} error={err(errors.idType)}>
              {(p) => <Select {...p} options={idOptions} value={draft.idType} onValueChange={(v) => set("idType", v)} />}
            </Field>
            <Field label={c.fields.idNumber.label} error={err(errors.idNumber)}>
              {(p) => <Input {...p} {...text("idNumber")} spellCheck={false} inputMode={draft.idType === "nin" ? "numeric" : "text"} className="tabular-nums" />}
            </Field>
            <Field label={c.fields.buzzId.label} help={c.fields.buzzId.help} error={err(errors.buzzId)} className="sm:col-span-2">
              {(p) => <Input {...p} {...text("buzzId")} autoCapitalize="none" spellCheck={false} placeholder={c.fields.buzzId.placeholder} className="sm:max-w-[20rem]" />}
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={c.fields.vehicleType.label} error={err(errors.vehicleType)}>
                {(p) => <Select {...p} options={c.vehicleTypes} value={draft.vehicleType} onValueChange={(v) => set("vehicleType", v)} />}
              </Field>
              <Field label={c.fields.plate.label} help={c.fields.plate.help} error={err(errors.plate)}>
                {(p) => <Input {...p} {...text("plate")} onChange={(e) => set("plate", e.target.value.toUpperCase())} className="code-text" spellCheck={false} />}
              </Field>
              <Field label={c.fields.model.label} error={err(errors.model)}>
                {(p) => <Input {...p} {...text("model")} placeholder={c.fields.model.placeholder} />}
              </Field>
              <Field label={c.fields.year.label} error={err(errors.year)}>
                {(p) => <Input {...p} {...text("year")} inputMode="numeric" maxLength={4} className="max-w-[8rem] tabular-nums" />}
              </Field>
            </div>

            <fieldset className="flex flex-col gap-4">
              <legend className="text-[14px] font-semibold text-ink-900">{c.fields.papers.label}</legend>
              <p className="-mt-2 text-[13px] text-ink-500">{c.fields.papers.help}</p>
              {errors.papers && <p className="text-[14px] text-alert-700">{err(errors.papers)}</p>}
              {draft.papers.map((paper, i) => (
                <div key={paper.id} className="flex flex-col gap-3 rounded-field border border-line p-4">
                  <div className="flex items-end gap-2">
                    <Field label={`${c.fields.paperName.label} ${i + 1}`} error={err(errors[`paperName:${paper.id}`])} className="flex-1">
                      {(p) => (
                        <Input
                          {...p}
                          value={paper.name}
                          onChange={(e) => set("papers", draft.papers.map((x) => (x.id === paper.id ? { ...x, name: e.target.value } : x)))}
                          placeholder={c.fields.paperName.placeholder}
                        />
                      )}
                    </Field>
                    {draft.papers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label={`Remove paper ${i + 1}`}
                        onClick={() => set("papers", draft.papers.filter((x) => x.id !== paper.id))}
                        icon={<Trash2 aria-hidden="true" className="size-4" strokeWidth={1.8} />}
                        className="mb-1"
                      >
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                  <UploadField
                    title={paper.name.trim() || `Paper ${i + 1}`}
                    value={paper.file}
                    onChange={(f) => setDraft((d) => ({ ...d, papers: d.papers.map((x) => (x.id === paper.id ? { ...x, file: f } : x)) }))}
                    error={err(errors[`paperFile:${paper.id}`])}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => set("papers", [...draft.papers, { id: `p${Date.now().toString(36)}`, name: "", file: null }])}
                icon={<Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />}
              >
                {c.fields.addPaper}
              </Button>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-[14px] font-semibold text-ink-900">{c.fields.photos.label}</legend>
              <p className="-mt-1 text-[13px] text-ink-500">{c.fields.photos.help}</p>
              {c.photos.map((ph) => (
                <UploadField
                  key={ph}
                  title={ph}
                  hint="A photo, up to 10 MB"
                  value={draft.photos[ph]}
                  onChange={(f) => setDraft((d) => ({ ...d, photos: { ...d.photos, [ph]: f } }))}
                  error={err(errors[`photo:${ph}`])}
                />
              ))}
            </fieldset>
          </div>
        )}

        {step === 2 && (
          <DocumentsStep
            documents={c.documents}
            files={draft.documents}
            onFile={(name, f) => setDraft((d) => ({ ...d, documents: { ...d.documents, [name]: f } }))}
            errors={errors}
            errorText={c.errors.document}
          />
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Field label={c.fields.perKm.label} error={err(errors.perKm)}>
              {(p) => <Input {...p} {...text("perKm")} inputMode="numeric" className="max-w-[12rem] tabular-nums" />}
            </Field>
            <p className="text-ui text-ink-700">{c.buzzAdds}</p>
            {Number(draft.perKm) >= 50 && (
              <p className="rounded-field bg-mist px-4 py-3 text-ui text-ink-900">
                {c.example.replace("{earn}", formatNaira(quote.earnings)).replace("{pays}", formatNaira(quote.buyerPays))}
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <p className="text-ui text-ink-700">
              Where: <span className="font-semibold text-ink-900">{c.inspectionAddress}</span>
            </p>
            <SlotPicker label="inspection" slots={slots} value={draft.slot} onChange={(s) => set("slot", s)} error={err(errors.slot)} />
            {draft.slot && <p className="text-ui font-semibold text-ink-900">{w.booked.replace("{when}", formatDateTime(draft.slot))}</p>}
            <p className="text-ui text-ink-700">{c.inspectionLength}</p>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <ReviewSection
              title={c.steps[0].name}
              onEdit={() => setStep(0)}
              rows={[
                [c.fields.fullName.label, draft.fullName],
                [c.fields.phone.label, draft.phone],
                [c.fields.email.label, draft.email],
                [c.fields.address.label, draft.address],
                [c.fields.idType.label, idOptions.find((o) => o.value === draft.idType)?.label ?? ""],
                [c.fields.idNumber.label, draft.idNumber],
                [c.fields.buzzId.label, draft.buzzId],
              ]}
            />
            <ReviewSection
              title={c.steps[1].name}
              onEdit={() => setStep(1)}
              rows={[
                [c.fields.vehicleType.label, draft.vehicleType],
                [c.fields.plate.label, draft.plate],
                [c.fields.model.label, `${draft.model} ${draft.year}`.trim()],
                [c.fields.papers.label, draft.papers.map((p) => p.name).filter(Boolean).join(", ")],
                [c.fields.photos.label, `${Object.values(draft.photos).filter(Boolean).length} of ${c.photos.length} uploaded`],
              ]}
            />
            <ReviewSection title={c.steps[2].name} onEdit={() => setStep(2)} rows={c.documents.map((d) => [d, draft.documents[d]?.fileName ?? ""] as [string, string])} />
            <ReviewSection title={c.steps[3].name} onEdit={() => setStep(3)} rows={[[c.fields.perKm.label, draft.perKm ? formatNaira(Number(draft.perKm)) : ""]]} />
            <ReviewSection title={c.steps[4].name} onEdit={() => setStep(4)} rows={[["Inspection", draft.slot ? `${formatDateTime(draft.slot)}, ${c.inspectionAddress}` : ""]]} />
            <TestNote>{w.test}</TestNote>
          </div>
        )}
      </Wizard>
    </>
  );
}
