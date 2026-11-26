"use client";

import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { Code } from "@/components/Code";
import { BOTTOM_BAR, NAV } from "./PortalShell";
import { PageHeader } from "./ui";
import { usePortal } from "./session";

/** "More" on phones: every screen that doesn't fit the bottom bar, the company code and Sign out */
export function PortalMore() {
  const { company, can, signOut } = usePortal();
  const rest = NAV.filter((n) => can(n.permission) && !BOTTOM_BAR.includes(n.label));

  return (
    <div className="mx-auto w-full max-w-[600px]">
      <PageHeader title="More" />
      <div className="mb-4 flex items-center justify-between gap-3 rounded-field border border-line bg-white px-5 py-4">
        <span className="text-label text-ink-500">Company code</span>
        <Code value={company.companyCode} label="Company code" size="sm" />
      </div>
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
