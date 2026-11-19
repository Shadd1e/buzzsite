"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1 + §3.4: codes (tracking ID, company code, rider code) in a
 * --blue-50 pill, tabular nums, 600, +0.02em, with a copy button.
 * The pill is 44px tall, so the copy button is a full touch target.
 */
export function Code({
  value,
  label,
  size = "md",
  copyable = true,
  showLabel = false,
  className,
}: {
  value: string;
  /** What this code is, for screen readers: "Tracking ID", "Rider code" */
  label: string;
  size?: "sm" | "md";
  copyable?: boolean;
  /** Show the label inside the pill, before the code */
  showLabel?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2000);
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full bg-blue-50 text-ink-900",
        size === "sm" ? "h-9 pl-3.5 text-[14px]" : "h-11 pl-4 text-[16px]",
        !copyable && (size === "sm" ? "pr-3.5" : "pr-4"),
        className,
      )}
    >
      {showLabel ? (
        <span className="mr-2 shrink-0 text-[12px] font-medium text-ink-500">{label}</span>
      ) : (
        <span className="sr-only">{label}: </span>
      )}
      <span className="code-text truncate">{value}</span>
      {copyable && (
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
          className={cn(
            "relative ml-1 grid shrink-0 place-items-center rounded-full text-blue-600",
            // sm is 36px visually; the ::after keeps a 44px touch target
            size === "sm" && "after:absolute after:-inset-1 after:content-['']",
            "transition-colors duration-(--dur-1) ease-out hover:bg-blue-100 hover:text-blue-700",
            size === "sm" ? "size-9" : "size-11",
          )}
        >
          {copied ? (
            <Check aria-hidden="true" className="size-[18px] text-ok-700" strokeWidth={2} />
          ) : (
            <Copy aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
          )}
        </button>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${label} copied` : failed ? "Couldn't copy. Select the code and copy it." : ""}
      </span>
    </span>
  );
}
