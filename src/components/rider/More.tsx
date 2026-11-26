"use client";

import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { Code } from "@/components/Code";
import { PageHeader } from "@/components/portal/ui";
import { useAccount } from "@/components/account/session";
import { navFor, useRider } from "./RiderShell";

const IN_BOTTOM_BAR = ["Overview", "Parcels", "Batches", "Payouts"];

/** "More" on phones: the screens that don't fit the bottom bar, the rider code and Sign out */
export function RiderMore() {
  const me = useRider();
  const { signOut } = useAccount();
  const rest = navFor(me.kind).filter((n) => !IN_BOTTOM_BAR.includes(n.label));

  return (
    <div className="mx-auto w-full max-w-[600px]">
      <PageHeader title="More" />
      {me.riderCode && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-field border border-line bg-white px-5 py-4">
          <span className="text-label text-ink-500">Rider code</span>
          <Code value={me.riderCode} label="Rider code" size="sm" />
        </div>
      )}
      <ul className="divide-y divide-line rounded-field border border-line bg-white">
        {rest.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex min-h-14 items-center gap-3 px-5 text-[15px] font-medium text-ink-900 hover:bg-blue-50">
              <Icon aria-hidden="true" className="size-5 text-ink-500" strokeWidth={1.7} />
              <span className="flex-1">{label}</span>
              <ChevronRight aria-hidden="true" className="size-4 text-ink-500" strokeWidth={1.8} />
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex min-h-14 w-full items-center gap-3 px-5 text-left text-[15px] font-medium text-ink-900 hover:bg-blue-50"
          >
            <LogOut aria-hidden="true" className="size-5 text-ink-500" strokeWidth={1.7} />
            Sign out
          </button>
        </li>
      </ul>
    </div>
  );
}
