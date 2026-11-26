"use client";

import { Clock, MapPin, Package, Warehouse } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { formatNaira, listPortalHubs } from "@/lib/data";
import type { Hub } from "@/lib/data/types";
import { AccessDenied, PageHeader } from "./ui";
import { usePortal, useLoad } from "./session";

/**
 * Hubs & pickup points (DESIGN.md §10.2): each with its address, hours and the
 * storage fee per day after the 5 free days, grouped by city.
 */
export function PortalHubs() {
  const { session, can } = usePortal();
  const allowed = can("view_hubs");
  const data = useLoad(() => (allowed ? listPortalHubs(session) : Promise.resolve([])), [session.staffId, allowed]);
  if (!allowed) return <AccessDenied what="see hubs" />;

  const byCity = (data.data ?? []).reduce<Record<string, Hub[]>>((acc, h) => {
    const city = h.city.replace(/\s*\(.*\)$/, "");
    (acc[city] ??= []).push(h);
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader
        title="Hubs & pickup points"
        meta="Parcels wait free for 5 days at a pickup point, with reminders on days 1, 3 and 5. After that your daily fee applies, and it goes back to the seller after 10 days."
      />
      {data.state === "error" ? (
        <EmptyState title="The hubs didn't load." body="Check your connection, then refresh." />
      ) : data.state === "loading" ? (
        <Skeleton className="h-48 w-full" />
      ) : data.data.length === 0 ? (
        <EmptyState icon={<Warehouse strokeWidth={1.7} />} title="No hubs on file." body="Contact the Buzz partner team to add your hubs and pickup points." />
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(byCity).map(([city, hubs]) => (
            <section key={city} aria-labelledby={`city-${city}`}>
              <h2 id={`city-${city}`} className="mb-3 text-section-title text-ink-900">
                {city}
              </h2>
              <ul className="divide-y divide-line rounded-field border border-line bg-white">
                {hubs.map((h) => (
                  <li key={h.id} className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-ui font-semibold text-ink-900">
                        {h.name}
                        {h.pickupPoint && (
                          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-blue-50 px-2 text-[12px] font-medium text-blue-700">
                            <Package aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                            Pickup point
                          </span>
                        )}
                      </p>
                      <p className="mt-1 flex items-start gap-1.5 text-ui text-ink-700">
                        <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-500" strokeWidth={1.8} />
                        {h.address}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-ui text-ink-700">
                        <Clock aria-hidden="true" className="size-4 shrink-0 text-ink-500" strokeWidth={1.8} />
                        {h.hours}
                      </p>
                    </div>
                    <p className="shrink-0 text-ui text-ink-700 md:text-right">
                      {h.pickupPoint ? (
                        <>
                          <span className="block font-semibold text-ink-900 tabular-nums">{formatNaira(h.storageFeePerDayAfterFree)} a day</span>
                          <span className="block text-meta text-ink-500">after 5 free days</span>
                        </>
                      ) : (
                        <span className="text-meta text-ink-500">Hub only, no customer pickup</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
