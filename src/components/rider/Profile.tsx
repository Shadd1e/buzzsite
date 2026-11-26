"use client";

import { CircleCheck, CircleDashed, FileText } from "lucide-react";
import { Code } from "@/components/Code";
import { Skeleton } from "@/components/Skeleton";
import { PageHeader, Panel } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { formatDate, getRiderProfile } from "@/lib/data";
import { LoadError } from "./states";
import { Facts } from "@/components/logistics/ops";

const DOC_STATE = {
  approved: { label: "Approved", cls: "text-ok-700" },
  uploaded: { label: "Being checked", cls: "text-warn-700" },
  rejected: { label: "Rejected", cls: "text-alert-700" },
  missing: { label: "Missing", cls: "text-ink-500" },
} as const;

/**
 * Profile (DESIGN.md §10.2): details, individual rider code, vehicle,
 * documents, inspection score. Company riders see their company, rider code
 * and the checks their company completed.
 */
export function RiderProfile() {
  const { session } = useAccount();
  const data = useLoad(() => getRiderProfile(session), [session.id]);

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <PageHeader title="Profile" meta="To change any of this, contact the Buzz partner team." />
      {data.state === "error" ? (
        <LoadError onRetry={data.reload} />
      ) : data.state === "loading" ? (
        <Skeleton className="h-64 w-full" />
      ) : data.data.kind === "individual" ? (
        (() => {
          const p = data.data;
          return (
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Panel title="Details" bodyClassName="px-5 py-2">
                <Facts
                  rows={[
                    ["Name", p.name],
                    ["Individual rider code", p.riderCode ? <Code key="c" value={p.riderCode} label="Individual rider code" size="sm" /> : "Not issued yet"],
                    ["Email", p.email],
                    ["Phone", p.phone],
                    ["Area", p.area],
                    ["Rating", p.rating !== null ? `${p.rating.toFixed(1)} out of 5` : "No ratings yet"],
                    ["Riding since", formatDate(p.joined)],
                  ]}
                />
              </Panel>

              <Panel title="Vehicle" bodyClassName="px-5 py-2">
                <Facts
                  rows={[
                    ["Type", p.vehicle.type],
                    ["Model", `${p.vehicle.model}, ${p.vehicle.year}`],
                    ["Plate", <span key="pl" className="code-text">{p.vehicle.plate}</span>],
                  ]}
                />
              </Panel>

              <Panel title="Inspection">
                <div className="flex items-baseline gap-2">
                  <span className="text-stat text-ink-900 tabular-nums">{p.inspection.score}</span>
                  <span className="text-ui text-ink-500">out of 100, inspected {formatDate(p.inspection.at)}</span>
                </div>
                <ul className="mt-4 flex flex-col gap-3">
                  {p.inspection.breakdown.map((b) => (
                    <li key={b.label}>
                      <div className="flex justify-between text-ui">
                        <span className="text-ink-700">{b.label}</span>
                        <span className="text-ink-900 tabular-nums">{b.score}</span>
                      </div>
                      <div
                        className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist"
                        role="meter"
                        aria-valuenow={b.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={b.label}
                      >
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${b.score}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Documents" bodyClassName="p-0">
                <ul className="divide-y divide-line">
                  {p.documents.map((d) => (
                    <li key={d.name} className="flex items-center justify-between gap-3 px-5 py-3">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <FileText aria-hidden="true" className="size-4 shrink-0 text-ink-500" strokeWidth={1.8} />
                        <span className="min-w-0">
                          <span className="block truncate text-ui text-ink-900">{d.name}</span>
                          <span className="block text-meta text-ink-500">Uploaded {formatDate(d.uploadedAt)}</span>
                        </span>
                      </span>
                      <span className={`shrink-0 text-meta font-medium ${DOC_STATE[d.status].cls}`}>{DOC_STATE[d.status].label}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          );
        })()
      ) : (
        (() => {
          const p = data.data;
          return (
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Panel title="Details" bodyClassName="px-5 py-2">
                <Facts
                  rows={[
                    ["Name", p.name],
                    ["Rider code", <Code key="c" value={p.riderCode} label="Rider code" size="sm" />],
                    ["Company", p.company],
                    ["Company code", <span key="cc" className="code-text">{p.companyCode}</span>],
                    ["Phone", <span key="ph" className="tabular-nums">{p.phone}</span>],
                    ["Vehicle", p.vehicle],
                    ["Rating", p.rating !== null ? `${p.rating.toFixed(1)} out of 5` : "No ratings yet"],
                    ["Riding since", formatDate(p.joined)],
                  ]}
                />
              </Panel>
              <Panel title={`Checked by ${p.company}`} bodyClassName="p-0">
                <ul className="divide-y divide-line">
                  {p.checks.map((c) => (
                    <li key={c.label} className="flex items-center gap-2.5 px-5 py-3 text-ui">
                      {c.done ? (
                        <CircleCheck aria-hidden="true" className="size-4 text-ok-700" strokeWidth={1.8} />
                      ) : (
                        <CircleDashed aria-hidden="true" className="size-4 text-ink-500" strokeWidth={1.8} />
                      )}
                      <span className="text-ink-900">{c.label}</span>
                      <span className="sr-only">{c.done ? "(done)" : "(not done)"}</span>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-line px-5 py-3 text-meta text-ink-500">
                  Your company sets these checks. Ask them to change your details.
                </p>
              </Panel>
            </div>
          );
        })()
      )}
    </div>
  );
}
