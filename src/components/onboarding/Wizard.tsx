"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, CircleAlert, Download, FileText, Save } from "lucide-react";
import { Button } from "@/components/Button";
import { StepProgress } from "@/components/StepProgress";
import { UploadSlot, type UploadState } from "@/components/UploadSlot";
import { TestNote } from "@/components/logistics/signin/shared";
import { wizardCopy as w } from "@/content/onboarding";
import { formatDateTime } from "@/lib/data/format";
import type { UploadedFile } from "@/lib/data";
import { cn } from "@/lib/cn";

/**
 * Guided onboarding shell (DESIGN.md §10.1): one step per screen, a progress
 * bar with step names, each step opening with why it's asked, inline errors,
 * Back / Continue and "Save and continue later". A white form card on mist.
 */
export function Wizard({
  steps,
  current,
  onBack,
  onNext,
  nextLabel = w.next,
  busy = false,
  hasErrors = false,
  onSaveLater,
  children,
}: {
  steps: Array<{ name: string; why: string }>;
  current: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  busy?: boolean;
  hasErrors?: boolean;
  onSaveLater?: () => void;
  children: ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const [saved, setSaved] = useState(false);

  // Each new step: focus its heading so keyboard and screen reader users start at the top
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus();
  }, [current]);

  return (
    <div className="rounded-convo border border-line bg-white p-5 sm:p-10">
      <StepProgress steps={steps.map((s) => s.name)} current={current} />

      <form
        noValidate
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onNext();
        }}
        className="mt-8 flex flex-col gap-6 sm:mt-10"
      >
        <div>
          <h2 ref={heading} tabIndex={-1} className="text-[clamp(24px,2.4vw,30px)] leading-tight font-light tracking-[-0.02em] text-ink-900 outline-none">
            {steps[current].name}
          </h2>
          <p className="mt-2 max-w-[36em] text-body text-ink-700">{steps[current].why}</p>
        </div>

        {hasErrors && (
          <p role="alert" className="flex items-start gap-2 rounded-field border border-alert-600/25 bg-alert-50 px-4 py-3 text-[14px] text-alert-700">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
            {w.fixErrors}
          </p>
        )}

        {children}

        <div className="mt-2 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {current > 0 && (
              <Button type="button" variant="ghost" onClick={onBack} icon={<ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
                {w.back}
              </Button>
            )}
            {onSaveLater && current < steps.length - 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onSaveLater();
                  setSaved(true);
                }}
                icon={<Save aria-hidden="true" className="size-4" strokeWidth={1.8} />}
              >
                {w.saveLater}
              </Button>
            )}
          </div>
          <Button type="submit" size="lg" loading={busy} className="w-full sm:w-auto">
            {nextLabel}
          </Button>
        </div>
        {saved && (
          <p role="status" className="text-[14px] text-ink-700">
            {w.saved} {w.uploadsNote}
          </p>
        )}
      </form>
    </div>
  );
}

/* ---------- drafts ---------- */

interface Saved<T> {
  draft: T;
  step: number;
  savedAt: string;
}

/**
 * "Save and continue later": the draft and step in this browser's storage.
 * Files can't be stored, so uploads are cleared from the saved copy.
 */
export function useDraft<T extends object>(key: string, stripFiles: (d: T) => T) {
  const [saved, setSaved] = useState<Saved<T> | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // Reading storage can only happen in the browser, after mount
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSaved(JSON.parse(raw) as Saved<T>);
    } catch {
      // Storage blocked or bad data: start fresh
    }
  }, [key]);
  return {
    saved,
    save(draft: T, step: number) {
      try {
        window.localStorage.setItem(key, JSON.stringify({ draft: stripFiles(draft), step, savedAt: new Date().toISOString() }));
      } catch {
        // Storage full or blocked: nothing else to do
      }
    },
    clear() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
      setSaved(null);
    },
    dismiss() {
      setSaved(null);
    },
  };
}

export function ResumeBanner({ savedAt, onResume, onRestart }: { savedAt: string; onResume: () => void; onRestart: () => void }) {
  return (
    <div role="status" className="mb-6 flex flex-col gap-3 rounded-field border border-blue-100 bg-blue-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[15px] font-semibold text-ink-900">{w.resumeTitle}</p>
        <p className="text-[14px] text-ink-700">{w.resumeBody.replace("{when}", formatDateTime(savedAt))}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" onClick={onResume}>
          {w.resume}
        </Button>
        <Button size="sm" variant="outline" onClick={onRestart}>
          {w.restart}
        </Button>
      </div>
    </div>
  );
}

/* ---------- uploads ---------- */

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * An upload slot that simulates the upload (test build): checks size and
 * type, shows progress, then holds the file name.
 */
export function UploadField({
  title,
  value,
  onChange,
  error,
  hint,
}: {
  title: string;
  value: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
  error?: string;
  hint?: string;
}) {
  const [state, setState] = useState<UploadState>(value ? "uploaded" : "empty");
  const [progress, setProgress] = useState(0);
  const [reason, setReason] = useState<string | undefined>();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  function pick(file: File) {
    if (file.size > MAX_BYTES) {
      setState("rejected");
      setReason("That file is over 10 MB. Upload a smaller copy or a photo.");
      onChange(null);
      return;
    }
    if (!/^(application\/pdf|image\/)/.test(file.type)) {
      setState("rejected");
      setReason("Upload a PDF or a photo.");
      onChange(null);
      return;
    }
    setReason(undefined);
    setState("uploading");
    setProgress(0);
    // Progress lives in a local counter: the parent's onChange must not run inside a state updater
    let p = 0;
    timer.current = setInterval(() => {
      p += 25;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        if (timer.current) clearInterval(timer.current);
        setState("uploaded");
        onChange({ fileName: file.name });
      }
    }, 180);
  }

  const shown: UploadState = error && state === "empty" ? "empty" : state;
  return (
    <div className={cn("flex flex-col gap-1.5", error && state === "empty" && "rounded-field ring-2 ring-alert-600/40")}>
      <UploadSlot
        title={title}
        hint={hint}
        state={shown}
        fileName={value?.fileName}
        progress={progress}
        reason={reason}
        onFile={pick}
        onCancel={() => {
          if (timer.current) clearInterval(timer.current);
          setState("empty");
          onChange(null);
        }}
      />
      {error && state === "empty" && (
        <p className="flex items-start gap-1.5 text-[14px] text-alert-700">
          <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
          {error}
        </p>
      )}
    </div>
  );
}

/** Download card for a document to sign. Test build: a placeholder text file. */
export function DownloadCard({ name }: { name: string }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="flex min-w-0 items-center gap-2.5">
        <FileText aria-hidden="true" className="size-5 shrink-0 text-blue-600" strokeWidth={1.7} />
        <span className="truncate text-ui text-ink-900">{name}</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const text = `${name}\n\nBuzz Logistics test build placeholder.\nThe real document will be provided by Buzz.\n`;
          const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
          const a = document.createElement("a");
          a.href = url;
          a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        icon={<Download aria-hidden="true" className="size-4" strokeWidth={1.8} />}
      >
        {w.download}
        <span className="sr-only"> {name}</span>
      </Button>
    </li>
  );
}

/** Documents step: download each, then upload the signed copy */
export function DocumentsStep({
  documents,
  files,
  onFile,
  errors,
  errorText,
}: {
  documents: string[];
  files: Record<string, UploadedFile | null>;
  onFile: (name: string, f: UploadedFile | null) => void;
  errors: Record<string, string>;
  errorText: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="dl-title">
        <h3 id="dl-title" className="mb-2 text-[16px] font-semibold text-ink-900">
          1. Download and sign
        </h3>
        <ul className="divide-y divide-line rounded-field border border-line">
          {documents.map((d) => (
            <DownloadCard key={d} name={d} />
          ))}
        </ul>
        <div className="mt-2">
          <TestNote>{w.downloadTest}</TestNote>
        </div>
      </section>
      <section aria-labelledby="ul-title" className="flex flex-col gap-3">
        <h3 id="ul-title" className="text-[16px] font-semibold text-ink-900">
          2. Upload the signed copies
        </h3>
        {documents.map((d) => (
          <UploadField key={d} title={`Signed ${d.toLowerCase()}`} value={files[d]} onChange={(f) => onFile(d, f)} error={errors[`doc:${d}`] ? errorText : undefined} />
        ))}
      </section>
    </div>
  );
}

/* ---------- review ---------- */

export function ReviewSection({ title, onEdit, rows }: { title: string; onEdit: () => void; rows: Array<[string, ReactNode]> }) {
  return (
    <section aria-label={title} className="rounded-field border border-line">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-4">
        <h3 className="text-[16px] font-semibold text-ink-900">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4">
          {w.edit}
          <span className="sr-only"> {title}</span>
        </button>
      </div>
      <dl className="divide-y divide-line px-4">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-6">
            <dt className="text-[13px] text-ink-500">{k}</dt>
            <dd className="text-[15px] break-words text-ink-900 sm:text-right">{v || "Not given"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
