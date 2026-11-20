"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Package, RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Code } from "@/components/Code";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import { useToast } from "@/components/Toast";
import { UploadSlot, type UploadState } from "@/components/UploadSlot";
import { Bubble, Convo, type ConvoMessage } from "@/components/chat";
import { formatDateTime, formatTime } from "@/lib/data/format";
import type { Parcel, Rider } from "@/lib/data/types";

const noSubscribe = () => () => {};

/** Shows a token's live value, read from CSS so this page can't drift from globals.css. */
export function Swatch({ token, role, dark }: { token: string; role: string; dark?: boolean }) {
  const value = useSyncExternalStore(
    noSubscribe,
    () => getComputedStyle(document.documentElement).getPropertyValue(token).trim().toUpperCase(),
    () => "",
  );
  return (
    <div className="flex items-center gap-3">
      <div aria-hidden="true" className="size-12 shrink-0 rounded-tile border border-line" style={{ background: `var(${token})` }} />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink-900">{token.replace("--color-", "")}</p>
        <p className="text-[12px] tabular-nums text-ink-500">{value || "…"}</p>
        <p className="text-[12px] text-ink-500">
          {role}
          {dark && ", dark theme"}
        </p>
      </div>
    </div>
  );
}

export function ChipDemo() {
  const options = ["All", "Products", "Housing", "Handymen"];
  const [selected, setSelected] = useState("All");
  return (
    <div role="group" aria-label="Category filter" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} selected={selected === o} onClick={() => setSelected(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

export function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast({
            title: "Parcel removed from batch",
            description: "BZT-SCG5-YW5H is now available for pickup in Ibadan.",
            action: { label: "Undo", onClick: () => toast({ title: "Parcel added back to batch", tone: "info" }) },
          })
        }
      >
        Remove from batch
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast({
            title: "Label didn't print",
            description: "Check the printer is on and connected, then print again.",
            tone: "error",
          })
        }
      >
        Print label
      </Button>
    </div>
  );
}

/** Danger action → confirm dialog → toast reusing the verb (§10.2). */
export function ConfirmDemo({ riderName }: { riderName: string }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Deactivate rider
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Deactivate ${riderName}?`}
        description="They won't be able to sign in or scan parcels. Their scan history is kept, and you can reactivate them later."
        confirmLabel="Deactivate rider"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 900));
          toast({ title: "Rider deactivated", description: `${riderName}'s history is kept.` });
        }}
      />
    </>
  );
}

/** Remounts the convo so the pop-in sequence can be watched again. */
export function ConvoReplay({
  messages,
  label,
  theme,
}: {
  messages: ConvoMessage[];
  label: string;
  theme?: "light" | "dark";
}) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-start gap-3">
      <Convo key={run} messages={messages} label={label} theme={theme} start="inView" className="w-full" />
      <Button
        variant="ghost"
        size="sm"
        icon={<RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.8} />}
        onClick={() => setRun((n) => n + 1)}
      >
        Replay
      </Button>
    </div>
  );
}

/* ---------- Table + drawer ---------- */

const states: Array<{ value: TableState; label: string }> = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
  { value: "no-results", label: "No results" },
];

export function TableDemo({ parcels }: { parcels: Parcel[] }) {
  const [state, setState] = useState<TableState>("ready");
  const [selected, setSelected] = useState<Parcel | null>(null);
  const [open, setOpen] = useState(false);

  const columns: Column<Parcel>[] = [
    { key: "id", header: "Tracking ID", mobile: "primary", cell: (p) => <span className="code-text">{p.trackingId}</span> },
    { key: "status", header: "Status", mobile: "primary", cell: (p) => <StatusPill status={p.status} size="sm" /> },
    { key: "route", header: "Route", cell: (p) => `${p.route[0]} to ${p.route.at(-1)}` },
    { key: "type", header: "Delivery", cell: (p) => (p.deliveryType === "home" ? "Home" : "Pickup") },
    { key: "last", header: "Last scan", align: "right", cell: (p) => formatDateTime(p.timeline.at(-1)!.at) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Show table state" className="flex flex-wrap gap-2">
        {states.map((s) => (
          <Chip key={s.value} selected={state === s.value} onClick={() => setState(s.value)}>
            {s.label}
          </Chip>
        ))}
      </div>
      <DataTable
        caption="Parcels for Swiftline Logistics"
        columns={columns}
        rows={parcels}
        getRowId={(p) => p.trackingId}
        rowLabel={(p) => `Open parcel ${p.trackingId}`}
        selectedId={open ? selected?.trackingId : selected?.trackingId}
        onSelect={(p) => {
          setSelected(p);
          setOpen(true);
        }}
        state={state}
        maxHeight="384px"
        onRetry={() => setState("loading")}
        empty={
          <EmptyState
            icon={<Package strokeWidth={1.8} />}
            title="No parcels yet."
            body="Parcels appear here when you generate a label from a Depot order ID."
            action={<Button size="sm">Generate label</Button>}
          />
        }
        noResults={
          <EmptyState
            icon={<SearchX strokeWidth={1.8} />}
            title="No parcels match this filter."
            body="Try another status, or search by tracking ID, order ID or batch code."
            action={
              <Button variant="outline" size="sm" onClick={() => setState("ready")}>
                Clear filters
              </Button>
            }
          />
        }
      />
      {selected && (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          title={selected.item}
          description={`Order ${selected.orderId}`}
          footer={
            <>
              <Button variant="outline" size="sm">
                Reprint label
              </Button>
              <Button variant="outline" size="sm">
                Assign rider
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={selected.status} />
              <Code value={selected.trackingId} label="Tracking ID" size="sm" />
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-ui">
              <dt className="text-ink-500">Receiver</dt>
              <dd className="text-ink-900">
                {selected.receiver.name}, prefers {selected.receiver.preferredContact === "buzz" ? "Buzz chat" : "a phone call"}
              </dd>
              <dt className="text-ink-500">Route</dt>
              <dd className="text-ink-900">{selected.route.join(", ")}</dd>
              <dt className="text-ink-500">Delivery code</dt>
              <dd className="text-ink-900">{selected.proof?.deliveryCodeVerified ? "Code verified" : "Not used yet"}</dd>
            </dl>
            <section aria-label="Timeline" className="flex flex-col gap-2 rounded-convo bg-blue-50 p-4">
              {selected.timeline
                .toReversed()
                .map((t, i) => (
                  <Bubble key={i} variant="system" sender={{ name: "Buzz Logistics", system: "buzz" }} time={formatTime(t.at)}>
                    {t.label}, {t.city}
                    {t.viaBatch && <span className="ml-1 text-[13px] text-ink-500">(batch scan)</span>}
                  </Bubble>
                ))}
            </section>
          </div>
        </Drawer>
      )}
    </div>
  );
}

/* ---------- Tabs ---------- */

export function TabsDemo({ riders }: { riders: Rider[] }) {
  const groups = {
    active: riders.filter((r) => r.status === "active"),
    pending: riders.filter((r) => r.status === "pending_verification"),
    deactivated: riders.filter((r) => r.status === "deactivated"),
  };
  const list = (rs: Rider[]) =>
    rs.length === 0 ? (
      <EmptyState title="No riders here." body="Riders move here when their status changes." />
    ) : (
      <ul className="divide-y divide-line rounded-field border border-line">
        {rs.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <span className="text-ui text-ink-900">{r.name}</span>
            <Code value={r.riderCode} label="Rider code" size="sm" />
          </li>
        ))}
      </ul>
    );
  return (
    <Tabs defaultValue="active">
      <TabsList aria-label="Riders by status">
        <TabsTrigger value="active" count={groups.active.length}>
          Active
        </TabsTrigger>
        <TabsTrigger value="pending" count={groups.pending.length}>
          Pending verification
        </TabsTrigger>
        <TabsTrigger value="deactivated" count={groups.deactivated.length}>
          Deactivated
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active">{list(groups.active)}</TabsContent>
      <TabsContent value="pending">{list(groups.pending)}</TabsContent>
      <TabsContent value="deactivated">{list(groups.deactivated)}</TabsContent>
    </Tabs>
  );
}

/* ---------- Upload (live) ---------- */

export function UploadDemo() {
  const [state, setState] = useState<UploadState>("empty");
  const [file, setFile] = useState<string>();
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  return (
    <UploadSlot
      title="Signed partner agreement"
      state={state}
      fileName={file}
      progress={progress}
      onFile={(f) => {
        setFile(f.name);
        setProgress(0);
        setState("uploading");
        clearInterval(timer.current);
        let p = 0;
        timer.current = setInterval(() => {
          p += 12;
          setProgress(Math.min(p, 100));
          if (p >= 100) {
            clearInterval(timer.current);
            setState("uploaded");
          }
        }, 180);
      }}
      onCancel={() => {
        clearInterval(timer.current);
        setState("empty");
      }}
    />
  );
}
