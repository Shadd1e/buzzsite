"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Lock, RotateCw, Smartphone, WifiOff } from "lucide-react";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Checkbox";
import { Logo } from "@/components/Logo";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { cn } from "@/lib/cn";
import { webCopy } from "@/content/web";
import type { Theme } from "./model";

/** Each code lives 60s (§11). After this many codes, it expires and needs a reload. */
const LIFETIME = 60;
const MAX_CODES = 4;

type Status = "qr" | "expired" | "scanning" | "syncing" | "offline";

function newToken() {
  // Illustrative pairing payload. A real backend issues a signed, single-use token.
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `buzz-web-link:${id}`;
}

/**
 * Pairing screen (DESIGN.md §11): live gradient (the only product screen with
 * it), a centred glass card, a QR that refreshes every 60s with a circular
 * countdown and expires after a few codes. States: expired, scanning,
 * syncing, phone offline. The test controls simulate the phone side.
 */
export function Pairing({ theme, onLinked }: { theme: Theme; onLinked: (keep: boolean) => void }) {
  const copy = webCopy.pairing;
  const [status, setStatus] = useState<Status>("qr");
  const [token, setToken] = useState(newToken);
  const [left, setLeft] = useState(LIFETIME);
  const [codes, setCodes] = useState(1);
  const [progress, setProgress] = useState(0);
  const [keep, setKeep] = useState(true);

  // The countdown. On zero: a fresh code, or expiry after MAX_CODES.
  useEffect(() => {
    if (status !== "qr") return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status !== "qr" || left > 0) return;
    /* eslint-disable react-hooks/set-state-in-effect -- the timer drives the code's lifecycle */
    if (codes >= MAX_CODES) {
      setStatus("expired");
    } else {
      setToken(newToken());
      setCodes((c) => c + 1);
      setLeft(LIFETIME);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [left, codes, status]);

  // Scan approved on the phone, then sync
  useEffect(() => {
    if (status === "scanning") {
      const t = setTimeout(() => setStatus("syncing"), 1800);
      return () => clearTimeout(t);
    }
    if (status === "syncing") {
      const t = setInterval(() => setProgress((p) => Math.min(100, p + 7)), 120);
      return () => clearInterval(t);
    }
  }, [status]);

  useEffect(() => {
    if (status !== "syncing" || progress < 100) return;
    const t = setTimeout(() => onLinked(keep), 350);
    return () => clearTimeout(t);
  }, [status, progress, onLinked, keep]);

  function regenerate() {
    setToken(newToken());
    setCodes(1);
    setLeft(LIFETIME);
    setProgress(0);
    setStatus("qr");
  }

  const dark = theme === "dark";
  const r = 17;
  const c = 2 * Math.PI * r;
  const waiting = status === "qr" || status === "expired" || status === "offline";

  return (
    <div className={cn("aurora flex h-full flex-col overflow-y-auto", dark && "aurora-navy")}>
      <TestDataRibbon />
      <header className="px-8 pt-6">
        <Logo variant={dark ? "white" : "full"} />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <section
          aria-labelledby="pair-title"
          className={cn(
            "w-full max-w-[920px] rounded-convo border border-white/60 p-8 shadow-float lg:p-12",
            // Glass over the light gradient; solid white over navy, where glass turns grey
            dark ? "bg-white" : "glass",
          )}
        >
          {status === "syncing" || status === "scanning" ? (
            <div className="mx-auto flex max-w-[420px] flex-col items-center py-10 text-center" role="status" aria-live="polite">
              <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-blue-600 text-white">
                <Smartphone className="size-7" strokeWidth={1.6} />
              </span>
              <h1 id="pair-title" className="mt-6 text-[28px] leading-tight font-medium text-ink-900">
                {status === "scanning" ? copy.scanning.title : copy.syncing.title}
              </h1>
              <p className="mt-2 text-[15px] text-ink-700">
                {status === "scanning" ? copy.scanning.body : copy.syncing.body}
              </p>
              {status === "syncing" && (
                <div
                  role="progressbar"
                  aria-label={copy.syncing.title}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="mt-8 h-2 w-full overflow-hidden rounded-full bg-blue-100"
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width] duration-(--dur-2) ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
              <div>
                <h1 id="pair-title" className="text-[28px] leading-tight font-medium text-ink-900">
                  {copy.title}
                </h1>
                <ol className="mt-7 flex flex-col gap-5">
                  {copy.steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-4 text-[17px] text-ink-900">
                      <span
                        aria-hidden="true"
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-[14px] font-semibold text-blue-700 tabular-nums"
                      >
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
                <p className="mt-3 pl-12 text-[13px] text-ink-500">{copy.pathNote}</p>
                <div className="mt-8 max-w-[380px] border-t border-line pt-4">
                  <Switch
                    label={copy.keepSignedIn}
                    description={copy.keepSignedInHint}
                    checked={keep}
                    onCheckedChange={setKeep}
                  />
                </div>
                <p className="mt-4 flex items-center gap-2 text-[14px] text-ink-700">
                  <Lock aria-hidden="true" className="size-4 text-blue-600" strokeWidth={1.8} />
                  {copy.encrypted}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative rounded-card border border-line bg-white p-4">
                  <QRCodeSVG
                    value={token}
                    size={232}
                    level="M"
                    marginSize={0}
                    fgColor="currentColor" /* text-ink-900 below: dark modules on the white tile */
                    bgColor="transparent"
                    title={copy.qrLabel}
                    className={cn(
                      "block text-ink-900 transition-[filter,opacity] duration-(--dur-3) ease-out",
                      status !== "qr" && "opacity-15 blur-[3px]",
                    )}
                  />
                  {status === "expired" && (
                    <div className="absolute inset-0 grid place-items-center p-6 text-center" role="alert">
                      <div className="flex flex-col items-center">
                        <p className="text-[16px] font-semibold text-ink-900">{copy.expired.title}</p>
                        <p className="mt-1 text-[13px] text-ink-700">{copy.expired.body}</p>
                        <Button onClick={regenerate} size="sm" className="mt-4" icon={<RotateCw aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
                          {copy.expired.action}
                        </Button>
                      </div>
                    </div>
                  )}
                  {status === "offline" && (
                    <div className="absolute inset-0 grid place-items-center p-6 text-center" role="alert">
                      <div className="flex flex-col items-center">
                        <WifiOff aria-hidden="true" className="size-6 text-warn-700" strokeWidth={1.8} />
                        <p className="mt-2 text-[16px] font-semibold text-ink-900">{copy.offline.title}</p>
                        <p className="mt-1 text-[13px] text-ink-700">{copy.offline.body}</p>
                        <Button onClick={regenerate} size="sm" variant="outline" className="mt-4">
                          {copy.offline.action}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {status === "qr" && (
                  <div className="flex items-center gap-3">
                    <svg aria-hidden="true" viewBox="0 0 40 40" className="size-10 -rotate-90">
                      <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3" className="stroke-blue-100" />
                      <circle
                        cx="20"
                        cy="20"
                        r={r}
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={c}
                        strokeDashoffset={c * (1 - left / LIFETIME)}
                        className="qr-ring stroke-blue-600"
                      />
                    </svg>
                    <p className="text-[14px] text-ink-700 tabular-nums">
                      {copy.refreshesIn(left)}
                      {/* Announce only the change of code, not every second */}
                      <span className="sr-only" aria-live="polite">
                        {left === LIFETIME ? "A new code is ready." : ""}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {waiting && (
          <div
            role="group"
            aria-label={copy.test.label}
            className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-warn-700/20 bg-warn-50 px-3 py-1.5"
          >
            <span className="px-2 text-[13px] font-semibold text-warn-700">{copy.test.label}</span>
            <button type="button" onClick={() => setStatus("scanning")} disabled={status !== "qr"} className={testBtn}>
              {copy.test.scan}
            </button>
            <button type="button" onClick={() => setStatus("expired")} disabled={status !== "qr"} className={testBtn}>
              {copy.test.expire}
            </button>
            <button type="button" onClick={() => setStatus("offline")} disabled={status !== "qr"} className={testBtn}>
              {copy.test.offline}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const testBtn =
  "min-h-11 rounded-full px-3 text-[13px] font-semibold text-warn-700 underline decoration-warn-700/30 underline-offset-4 hover:bg-white/70 hover:decoration-warn-700 disabled:opacity-45 disabled:no-underline";
