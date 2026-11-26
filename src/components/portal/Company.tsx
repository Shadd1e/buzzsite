"use client";

import { FileText } from "lucide-react";
import { Code } from "@/components/Code";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Facts } from "@/components/logistics/ops";
import { formatDate, getCompanyProfile } from "@/lib/data";
import { AccessDenied, PageHeader, Panel } from "./ui";
import { usePortal, useLoad } from "./session";

const DOC_STATE = {
  approved: { label: "Approved", cls: "text-ok-700" },
  uploaded: { label: "Being checked", cls: "text-warn-700" },
  rejected: { label: "Needs a new upload", cls: "text-alert-700" },
  missing: { label: "Missing", cls: "text-ink-500" },
} as const;

const SERVICE = { intrastate: "Intrastate", interstate: "Interstate", international: "International (Africa)" } as const;

/** Company (DESIGN.md §10.2): profile, company code, documents, inspection score with breakdown */
export function PortalCompany() {
  const { session, can } = usePortal();
  const allowed = can("view_company");
  const data = useLoad(() => (allowed ? getCompanyProfile(session) : Promise.resolve(null)), [session.staffId, allowed]);
  if (!allowed) return <AccessDenied what="see the company record" />;

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader title="Company" meta="To change any of this, talk to your Buzz partner manager." />
      {data.state === "error" ? (
        <EmptyState title="The company record didn't load." body="Check your connection, then refresh." />
      ) : data.state === "loading" || !data.data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        (() => {
          const { partner: p, record: r } = data.data;
          return (
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Panel title="Profile" bodyClassName="px-5 py-2">
                <Facts
                  rows={[
                    ["Company", p.name],
                    ["Company code", <Code key="c" value={p.companyCode} label="Company code" size="sm" />],
                    ["CAC number", <span key="cac" className="code-text">{r.cac}</span>],
                    ["Address", r.address],
                    ["Services", p.services.map((s) => SERVICE[s]).join(", ")],
                    ["States", p.states.join(", ")],
                    ...(p.countries?.length ? ([["Countries", p.countries.join(", ")]] as Array<[string, string]>) : []),
                    ["Main contact", `${p.contact.name}, ${p.contact.email}`],
                    ["Payout account", p.payoutBank],
                    ["Partner since", formatDate(p.joined)],
                  ]}
                />
              </Panel>

              <Panel title="Inspection">
                <div className="flex items-baseline gap-2">
                  <span className="text-stat text-ink-900 tabular-nums">{r.inspection.score}</span>
                  <span className="text-ui text-ink-500">out of 100, inspected {formatDate(r.inspection.at)}</span>
                </div>
                <ul className="mt-4 flex flex-col gap-3">
                  {r.inspection.breakdown.map((b) => (
                    <li key={b.label}>
                      <div className="flex justify-between gap-3 text-ui">
                        <span className="text-ink-700">
                          {b.label} <span className="text-meta text-ink-500">({b.weight}% of the score)</span>
                        </span>
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

              <Panel title="Documents" bodyClassName="p-0" className="lg:col-span-2">
                <ul className="divide-y divide-line">
                  {r.documents.map((d) => (
                    <li key={d.name} className="flex items-start justify-between gap-3 px-5 py-3">
                      <span className="flex min-w-0 items-start gap-2.5">
                        <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-500" strokeWidth={1.8} />
                        <span className="min-w-0">
                          <span className="block text-ui text-ink-900">{d.name}</span>
                          <span className="block text-meta text-ink-500">Uploaded {formatDate(d.uploadedAt)}</span>
                          {d.note && <span className="mt-0.5 block text-meta text-alert-700">{d.note}</span>}
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
      )}
    </div>
  );
}
