"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { CircleAlert, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TrackFormCopy } from "./TrackForm";

/**
 * Scan a parcel label's QR code with the camera (html5-qrcode). The library
 * loads only when the scanner opens, so it never costs data on page load.
 * Accepts a bare tracking ID or any text containing one (e.g. a track URL).
 */
const ID_IN_TEXT = /BZT-[A-Z0-9]{4}-[A-Z0-9]{4}/i;

type State = "starting" | "scanning" | "denied" | "unavailable";

export function QrScanner({
  open,
  onOpenChange,
  onResult,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (trackingId: string) => void;
  copy: TrackFormCopy["scanner"];
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/60 data-[state=open]:animate-overlay-in" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col gap-4 rounded-t-convo bg-white p-5 pb-8 shadow-float data-[state=open]:animate-drawer-up sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-convo sm:data-[state=open]:animate-dialog-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-h3 text-ink-900">{copy.title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-[15px] text-ink-700">{copy.description}</Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={copy.close}
              className="-mt-1 -mr-1 grid size-11 shrink-0 place-items-center rounded-full text-ink-900 hover:bg-mist"
            >
              <X aria-hidden="true" className="size-6" strokeWidth={1.8} />
            </Dialog.Close>
          </div>
          {/* Mounts only while open, so each opening starts fresh */}
          <Camera copy={copy} onResult={onResult} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Camera({ copy, onResult }: { copy: TrackFormCopy["scanner"]; onResult: (trackingId: string) => void }) {
  const regionId = `qr-${useId().replace(/:/g, "")}`;
  const [state, setState] = useState<State>(() =>
    typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia ? "unavailable" : "starting",
  );
  const [notTracking, setNotTracking] = useState(false);
  // Latest callback without restarting the camera when the parent re-renders
  const resultRef = useRef(onResult);
  useEffect(() => {
    resultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    let cancelled = false;
    let stop: (() => Promise<void>) | null = null;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const scanner = new Html5Qrcode(regionId, { verbose: false });
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.7, height: Math.min(w, h) * 0.7 }) },
          (text) => {
            const match = text.match(ID_IN_TEXT);
            if (match) resultRef.current(match[0].toUpperCase());
            else setNotTracking(true);
          },
          () => {},
        );
        stop = async () => {
          try {
            await scanner.stop();
            scanner.clear();
          } catch {
            /* already stopped */
          }
        };
        if (cancelled) await stop();
        else setState("scanning");
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : String(err);
        setState(/NotAllowed|Permission/i.test(name) ? "denied" : "unavailable");
      }
    })();

    return () => {
      cancelled = true;
      void stop?.();
    };
  }, [regionId]);

  const message =
    state === "denied" ? copy.denied : state === "unavailable" ? copy.unavailable : notTracking ? copy.notTracking : null;

  return (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-card bg-navy">
        <div id={regionId} className="size-full [&_video]:size-full [&_video]:object-cover" />
        {state === "starting" && (
          <p className="absolute inset-0 grid place-items-center text-[15px] text-white">
            <span className="flex items-center gap-2">
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin" strokeWidth={1.8} />
              {copy.starting}
            </span>
          </p>
        )}
      </div>
      <p
        role="status"
        className={cn(
          "flex min-h-6 items-start gap-1.5 text-[15px] leading-snug text-alert-700",
          !message && "sr-only",
        )}
      >
        {message && <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />}
        {message}
      </p>
    </>
  );
}
