import type { Metadata } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { listParcels } from "@/lib/data";
import type { ParcelStatus } from "@/lib/data/types";

export const metadata: Metadata = { title: "Test tracking IDs", robots: { index: false } };

/** Dev tooling (BUILD-GUIDE Phase C): a real test tracking ID for every Track state. */
export default async function TestIdsPage() {
  const parcels = await listParcels();
  const byStatus = new Map<ParcelStatus, string[]>();
  for (const p of parcels) byStatus.set(p.status, [...(byStatus.get(p.status) ?? []), p.trackingId]);

  return (
    <main className="container-page py-12">
      <TestDataRibbon />
      <h1 className="text-page-title text-ink-900">Test tracking IDs</h1>
      <p className="mt-2 text-ui text-ink-700">
        Every state on <Link className="text-blue-700 underline" href="/logistics/track">/logistics/track</Link>.
        Try <Link className="text-blue-700 underline" href="/logistics/track/BZT-0000-0000">an unknown ID</Link> for
        the not-found state.
      </p>
      <table className="mt-8 w-full border-collapse text-ui">
        <thead>
          <tr className="border-b border-line text-left text-label text-ink-500">
            <th className="py-3 pr-6 font-medium">Status</th>
            <th className="py-3 font-medium">Tracking IDs</th>
          </tr>
        </thead>
        <tbody>
          {[...byStatus].map(([status, ids]) => (
            <tr key={status} className="border-b border-line align-top">
              <td className="py-3 pr-6">
                <StatusPill status={status} size="sm" />
              </td>
              <td className="flex flex-wrap gap-x-4 gap-y-1 py-3">
                {ids.map((id) => (
                  <Link key={id} href={`/logistics/track/${id}`} className="code-text text-blue-700 underline">
                    {id}
                  </Link>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
