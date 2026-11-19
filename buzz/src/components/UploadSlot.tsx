"use client";

import { useId } from "react";
import { CircleAlert, CircleCheck, FileText, Upload } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Document upload slot (DESIGN.md §10.1, partner onboarding step 4):
 * empty / uploading / uploaded / rejected with reason.
 */
export type UploadState = "empty" | "uploading" | "uploaded" | "rejected";

export function UploadSlot({
  title,
  hint = "PDF or photo, up to 10 MB",
  state,
  fileName,
  progress = 0,
  reason,
  accept = "application/pdf,image/*",
  onFile,
  onCancel,
}: {
  /** The document: "Signed partner agreement" */
  title: string;
  hint?: string;
  state: UploadState;
  fileName?: string;
  /** 0–100 while uploading */
  progress?: number;
  /** Why it was rejected and what to do: "The signature page is missing. Upload all 6 pages." */
  reason?: string;
  accept?: string;
  onFile?: (file: File) => void;
  onCancel?: () => void;
}) {
  const id = useId();
  const pickLabel = { empty: "Choose file", uploading: "", uploaded: "Replace", rejected: "Upload again" }[state];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-field border-[1.5px] p-4 sm:flex-row sm:items-center",
        state === "empty" && "border-dashed border-line-strong bg-white",
        state === "uploading" && "border-blue-100 bg-blue-50",
        state === "uploaded" && "border-line bg-white",
        state === "rejected" && "border-alert-600 bg-alert-50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-tile",
          state === "uploaded" ? "bg-ok-50 text-ok-700" : state === "rejected" ? "bg-white text-alert-700" : "bg-blue-50 text-blue-600",
          state === "uploading" && "bg-white",
        )}
      >
        {state === "uploaded" ? (
          <CircleCheck className="size-5" strokeWidth={1.8} />
        ) : state === "rejected" ? (
          <CircleAlert className="size-5" strokeWidth={1.8} />
        ) : (
          <FileText className="size-5" strokeWidth={1.8} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink-900">{title}</p>
        {state === "empty" && <p className="text-[13px] text-ink-500">{hint}</p>}
        {state === "uploading" && (
          <>
            <p className="truncate text-[13px] text-ink-700">
              Uploading {fileName} <span className="tabular-nums">{Math.round(progress)}%</span>
            </p>
            <div
              role="progressbar"
              aria-label={`Uploading ${title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"
            >
              <div className="h-full rounded-full bg-blue-600 transition-[width] duration-(--dur-2) ease-out" style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
        {state === "uploaded" && (
          <p className="truncate text-[13px] text-ink-700">
            <span className="sr-only">Uploaded: </span>
            {fileName}
          </p>
        )}
        {state === "rejected" && (
          <p className="text-[13px] text-alert-700">
            <span className="font-semibold">Rejected. </span>
            {reason}
          </p>
        )}
      </div>

      {state === "uploading" ? (
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 self-start rounded-full px-4 text-[14px] font-semibold text-ink-700 hover:bg-white sm:self-center"
        >
          Cancel
        </button>
      ) : (
        <label
          htmlFor={id}
          className={cn(
            "inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-full border-[1.5px] px-4 text-[14px] font-semibold sm:self-center",
            "transition-colors duration-(--dur-1) ease-out focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-sky-400",
            state === "empty" ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700" : "border-line-strong bg-white text-ink-900 hover:border-ink-900",
          )}
        >
          <Upload aria-hidden="true" className="size-4" strokeWidth={1.8} />
          {pickLabel}
          <span className="sr-only">: {title}</span>
          <input
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile?.(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
