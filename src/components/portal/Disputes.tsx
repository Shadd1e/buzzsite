"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { FilterChips } from "@/components/logistics/ops";
import { CaseDetail, CaseList } from "@/components/logistics/ops-cases";
import { listCompanyDisputes, respondToCompanyDispute } from "@/lib/data";
import { AccessDenied, PageHeader } from "./ui";
import { usePortal, useLoad } from "./session";

type Show = "open" | "decided" | "all";

/**
 * Disputes & claims (DESIGN.md §10.2): cases involving this partner, with the
 * 5-day countdown, the evidence and the company's response. Damage is covered
 * by Buzz only when the fault is proven to be Buzz's; otherwise the partner
 * handles it (PRODUCT.md).
 */
export function PortalDisputes() {
  const { session, can } = usePortal();
  const toast = useToast();
  const [show, setShow] = useState<Show>("open");
  const [openId, setOpenId] = useState<string | null>(null);
  const allowed = can("view_disputes");
  const data = useLoad(() => (allowed ? listCompanyDisputes(session) : Promise.resolve([])), [session.staffId, allowed]);
  if (!allowed) return <AccessDenied what="see disputes" />;

  const rows = (data.data ?? []).filter((d) => (show === "all" ? true : show === "open" ? d.status !== "resolved" : d.status === "resolved"));
  const open = data.data?.find((d) => d.id === openId) ?? null;

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <PageHeader
        title="Disputes & claims"
        meta="Buyers have 5 days after delivery to open a case. Buzz covers damage only when the fault is proven to be Buzz's."
      />
      <div className="mb-4">
        <FilterChips
          label="Show"
          value={show}
          onChange={setShow}
          options={[
            { key: "open", label: "Open", count: data.data?.filter((d) => d.status !== "resolved").length },
            { key: "decided", label: "Decided" },
            { key: "all", label: "All" },
          ]}
        />
      </div>
      {data.state === "error" ? (
        <EmptyState title="Cases didn't load." body="Check your connection, then refresh." />
      ) : data.state === "loading" ? (
        <Skeleton className="h-40 w-full" />
      ) : data.data.length === 0 ? (
        <EmptyState icon={<Scale strokeWidth={1.7} />} title="No disputes involving your company." body="If a buyer opens one, it shows here with the evidence." />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Scale strokeWidth={1.7} />} title={show === "open" ? "No open cases right now." : "No decided cases yet."} />
      ) : (
        <CaseList cases={rows} onOpen={setOpenId} />
      )}

      <Drawer open={!!open} onOpenChange={(o) => !o && setOpenId(null)} title={open?.reason ?? "Case"} description={open ? `${open.id}, ${open.trackingId}` : undefined}>
        {open && (
          <CaseDetail
            dispute={open}
            canRespond={can("respond_dispute")}
            prompt="What happened at delivery?"
            help="Say what your rider saw: the parcel's condition, who received it and the time. Buzz checks it against the scan log."
            onRespond={async (text) => {
              await respondToCompanyDispute(session, open.id, text);
              toast({ title: "Response sent", description: `Buzz will review ${open.id} with your response.` });
              data.reload();
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
