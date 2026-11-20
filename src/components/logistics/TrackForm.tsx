"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { normaliseTrackingId, TRACKING_ID_PATTERN } from "@/lib/data/tracking-id";
import { cn } from "@/lib/cn";
import { QrScanner } from "./QrScanner";

/**
 * The tracking input (DESIGN.md §10.1): type a tracking ID, or "Scan QR" with
 * the camera on touch devices. Valid IDs go to /logistics/track/[id]; a badly
 * formed ID gets an inline error with the format and an example.
 */
export interface TrackFormCopy {
  label: string;
  placeholder: string;
  help: string;
  submit: string;
  scan: string;
  errors: { empty: string; format: string };
  scanner: {
    title: string;
    description: string;
    starting: string;
    denied: string;
    unavailable: string;
    notTracking: string;
    close: string;
  };
}

export function TrackForm({ copy, className }: { copy: TrackFormCopy; className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const go = (id: string) => router.push(`/logistics/track/${encodeURIComponent(id)}`);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const id = normaliseTrackingId(value);
    if (!id) return setError(copy.errors.empty);
    if (!TRACKING_ID_PATTERN.test(id)) return setError(copy.errors.format);
    setError(null);
    go(id);
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("max-w-[640px]", className)}>
      <Field label={copy.label} help={copy.help} error={error ?? undefined}>
        {(props) => (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              {...props}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder={copy.placeholder}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="go"
              className="code-text bg-white/90 sm:flex-1 text-[17px] uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case"
            />
            <div className="flex gap-3">
              <Button type="submit" size="lg" className="flex-1 sm:flex-none">
                {copy.submit}
              </Button>
              {/* Camera scanning is for phones and tablets (§10.1) */}
              <span className="hidden flex-1 pointer-coarse:flex sm:flex-none">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  icon={<ScanLine aria-hidden="true" className="size-5" strokeWidth={1.8} />}
                  onClick={() => setScanning(true)}
                >
                  {copy.scan}
                </Button>
              </span>
            </div>
          </div>
        )}
      </Field>
      <QrScanner
        open={scanning}
        onOpenChange={setScanning}
        copy={copy.scanner}
        onResult={(id) => {
          setScanning(false);
          setValue(id);
          go(id);
        }}
      />
    </form>
  );
}
