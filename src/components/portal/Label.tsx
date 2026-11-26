"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Tag } from "lucide-react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { useToast } from "@/components/Toast";
import { TestNote } from "@/components/logistics/signin/shared";
import { getLabelForOrder, PortalError, recordLabelPrinted, type ThermalLabel } from "@/lib/data";
import { cn } from "@/lib/cn";
import { AccessDenied, PageHeader, Panel } from "./ui";
import { usePortal } from "./session";

type Size = "4x6" | "3x2";

/**
 * Generate label (DESIGN.md §10.2): enter a Depot order ID, preview the
 * thermal label (4×6 or 3×2) with the QR, tracking ID and destination city,
 * then print. ?order= pre-fills it (Reprint label on a parcel links here).
 */
export function GenerateLabel() {
  const { session, can } = usePortal();
  const params = useSearchParams();
  const toast = useToast();
  const [orderId, setOrderId] = useState(params.get("order") ?? "");
  const [label, setLabel] = useState<ThermalLabel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState<Size>("4x6");
  const autoRan = useRef(false);

  async function find(id: string) {
    setBusy(true);
    setError(null);
    try {
      setLabel(await getLabelForOrder(session, id));
    } catch (e) {
      setLabel(null);
      setError(e instanceof PortalError ? (e.fields?.orderId ?? e.message) : "That didn't load. Try again.");
    } finally {
      setBusy(false);
    }
  }

  // Reprint from a parcel: look the order up straight away, once
  useEffect(() => {
    const pre = params.get("order");
    if (pre && !autoRan.current && can("print_label")) {
      autoRan.current = true;
      void find(pre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!can("print_label")) return <AccessDenied what="print labels" />;

  async function print() {
    if (!label) return;
    window.print();
    await recordLabelPrinted(session, label.trackingId);
    toast({ title: "Label sent to the printer", description: `${label.trackingId} is marked as printed.` });
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <PageHeader title="Generate label" meta="Enter the Depot order ID at pickup to print its thermal QR label." />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Panel title="Order">
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void find(orderId);
            }}
            noValidate
            className="flex flex-col gap-4"
          >
            <Field label="Depot order ID" help="It's on the Depot order, like DPT-238739." error={error ?? undefined}>
              {(props) => (
                <Input
                  {...props}
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="code-text"
                />
              )}
            </Field>
            <Button type="submit" loading={busy} icon={<Tag aria-hidden="true" className="size-4" strokeWidth={1.8} />} className="self-start">
              Show label
            </Button>
          </form>
          <div className="mt-6">
            <TestNote>Test build: try an order from your Parcels list, for example DPT-238739.</TestNote>
          </div>
        </Panel>

        <Panel
          title="Preview"
          action={
            label && (
              <div role="radiogroup" aria-label="Label size" className="inline-flex rounded-full border border-line-strong bg-white p-1">
                {(["4x6", "3x2"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={size === s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "inline-flex min-h-9 items-center rounded-full px-3 text-[13px] font-semibold tabular-nums",
                      size === s ? "bg-ink-900 text-white" : "text-ink-700 hover:text-ink-900",
                    )}
                  >
                    {s === "4x6" ? "4 × 6 in" : "3 × 2 in"}
                  </button>
                ))}
              </div>
            )
          }
        >
          {label ? (
            <div className="flex flex-col items-center gap-5">
              <LabelPreview label={label} size={size} />
              <Button onClick={print} icon={<Printer aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
                Print label
              </Button>
            </div>
          ) : (
            <EmptyState icon={<Tag strokeWidth={1.7} />} title="No label yet." body="Enter a Depot order ID to see its label here." className="border-0 py-10" />
          )}
        </Panel>
      </div>
    </div>
  );
}

/**
 * The thermal label itself: printed in one ink on white, so it uses ink only.
 * .print-label is the only thing that prints (globals.css @media print).
 */
export function LabelPreview({ label: l, size }: { label: ThermalLabel; size: Size }) {
  const tall = size === "4x6";
  return (
    <figure
      aria-label={`Label for ${l.trackingId}`}
      data-size={size}
      className={cn(
        "print-label flex border-2 border-ink-900 bg-white text-ink-900",
        tall ? "aspect-[2/3] w-[260px] flex-col gap-3 p-4" : "aspect-[3/2] w-[330px] flex-row gap-3 p-3",
      )}
    >
      <div className={cn("flex flex-col", tall ? "gap-1" : "min-w-0 flex-1 justify-between")}>
        <p className="text-[11px] font-semibold tracking-[0.02em]">
          {l.companyName}, {l.companyCode}
        </p>
        {!tall && <p className="code-text text-[15px] leading-tight">{l.trackingId}</p>}
        <div>
          <p className="text-[10px] font-medium">To</p>
          <p className={cn("leading-tight font-bold", tall ? "text-[22px]" : "text-[16px]")}>{l.destination}</p>
          <p className="text-[11px]">{l.deliveryType === "home" ? "Home delivery" : "Pickup point"}</p>
        </div>
        {!tall && <p className="code-text text-[11px]">{l.orderId}</p>}
      </div>
      <div className={cn("flex items-center justify-center", tall ? "flex-1" : "shrink-0")}>
        <QRCodeSVG value={l.trackingId} size={tall ? 168 : 112} level="M" fgColor="currentColor" bgColor="transparent" />
      </div>
      {tall && (
        <div className="flex flex-col gap-1 border-t-2 border-ink-900 pt-2">
          <p className="code-text text-center text-[18px]">{l.trackingId}</p>
          <p className="flex justify-between text-[11px]">
            <span>From {l.from}</span>
            <span className="code-text">{l.orderId}</span>
          </p>
          <p className="truncate text-[11px]">Receiver: {l.receiverName}</p>
        </div>
      )}
    </figure>
  );
}
