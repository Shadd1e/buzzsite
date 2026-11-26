import type { Metadata } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import { TestDataRibbon } from "@/components/TestDataRibbon";
import { listParcels, listTestAccounts, listTestRiders, TEST_CREDENTIALS } from "@/lib/data";
import { ROLE_LABEL } from "@/lib/portal-access";
import type { ParcelStatus } from "@/lib/data/types";

export const metadata: Metadata = { title: "Test tracking IDs", robots: { index: false } };

/** Dev tooling (BUILD-GUIDE Phase C): a real test tracking ID for every Track state. */
export default async function TestIdsPage() {
  const parcels = await listParcels();
  // Individual riders have emails too, but sign in as riders (table above), not as partner staff
  const accounts = listTestAccounts().filter((a) => a.accountType === "company");
  const riders = listTestRiders();
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

      <h2 className="mt-14 text-section-title text-ink-900">Rider sign in test codes</h2>
      <p className="mt-2 text-ui text-ink-700">
        At the top of <Link className="text-blue-700 underline" href="/logistics/portal/login">/logistics/portal/login</Link>.
        Company riders use company code + rider code. Individual riders use rider code + password{" "}
        <span className="code-text">{TEST_CREDENTIALS.password}</span>, or their Buzz ID (then the simulate button).
      </p>
      <table className="mt-6 w-full border-collapse text-ui">
        <thead>
          <tr className="border-b border-line text-left text-label text-ink-500">
            <th className="py-3 pr-6 font-medium">Name</th>
            <th className="py-3 pr-6 font-medium">Kind</th>
            <th className="py-3 pr-6 font-medium">Codes</th>
            <th className="py-3 pr-6 font-medium">Status</th>
            <th className="py-3 font-medium">Lands on</th>
          </tr>
        </thead>
        <tbody>
          {riders.map((r) => (
            <tr key={r.name} className="border-b border-line">
              <td className="py-3 pr-6">{r.name}</td>
              <td className="py-3 pr-6">{r.kind === "individual" ? "Individual rider" : "Company rider"}</td>
              <td className="code-text py-3 pr-6">{[r.companyCode, r.riderCode, r.buzzId].filter(Boolean).join(" + ")}</td>
              <td className="py-3 pr-6">{r.status.replace(/_/g, " ")}</td>
              <td className="py-3">{r.landsOn}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-14 text-section-title text-ink-900">Partner sign in test accounts</h2>
      <p className="mt-2 text-ui text-ink-700">
        Sign in at <Link className="text-blue-700 underline" href="/logistics/portal/login">/logistics/portal/login</Link>.
        Password <span className="code-text">{TEST_CREDENTIALS.password}</span>, 2FA code{" "}
        <span className="code-text">{TEST_CREDENTIALS.code}</span>. Five wrong passwords lock an account for 15 minutes.
        Changes last until the browser tab closes, or until Team, then Reset test data.
      </p>
      <table className="mt-6 w-full border-collapse text-ui">
        <thead>
          <tr className="border-b border-line text-left text-label text-ink-500">
            <th className="py-3 pr-6 font-medium">Email</th>
            <th className="py-3 pr-6 font-medium">Name</th>
            <th className="py-3 pr-6 font-medium">Level</th>
            <th className="py-3 pr-6 font-medium">Company</th>
            <th className="py-3 font-medium">Lands on</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.email} className="border-b border-line">
              <td className="code-text py-3 pr-6">{a.email}</td>
              <td className="py-3 pr-6">{a.name}</td>
              <td className="py-3 pr-6">{a.role ? ROLE_LABEL[a.role] : "Company (in review)"}</td>
              <td className="py-3 pr-6">{a.company}</td>
              <td className="py-3">{a.landsOn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
