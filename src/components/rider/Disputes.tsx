"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { CaseDetail, CaseList } from "@/components/logistics/ops-cases";
import { PageHeader } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { useLoad } from "@/components/portal/session";
import { listRiderDisputes, respondToRiderDispute } from "@/lib/data";
import { LoadError } from "./states";

/**
 * Disputes & claims (DESIGN.md §10.2): cases about this rider's deliveries,
 * with the 5-day countdown, the evidence (buyer and seller chat as bubbles)
 * and the rider's response. Individual riders only.
 */
export function RiderDisputes() {
  const { session } = useAccount();
  const data = useLoad(() => listRiderDisputes(session), [session.id]);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = data.data?.find((d) => d.id === openId) ?? null;

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <PageHeader title="Disputes & claims" meta="When a buyer disputes an order you delivered. Buyers have 5 days to open one." />
      {data.state === "error" ? (
        <LoadError onRetry={data.reload} />
      ) : data.state === "loading" ? (
        <Skeleton className="h-40 w-full" />
      ) : data.data.length === 0 ? (
        <EmptyState icon={<Scale strokeWidth={1.7} />} title="No disputes about your deliveries." body="If a buyer opens one, you'll see it here with the evidence." />
      ) : (
        <CaseList cases={data.data} onOpen={setOpenId} />
      )}

      <Drawer open={!!open} onOpenChange={(o) => !o && setOpenId(null)} title={open?.reason ?? "Dispute"} description={open ? `${open.id}, ${open.trackingId}` : undefined}>
        {open && (
          <CaseDetail
            dispute={open}
            onRespond={async (text) => {
              await respondToRiderDispute(session, open.id, text);
              data.reload();
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
