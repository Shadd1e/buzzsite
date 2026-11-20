"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Tabs as RadixTabs } from "radix-ui";
import { cn } from "@/lib/cn";

/**
 * Product tabs (DESIGN.md §10.2: Riders → Active / Pending verification /
 * Deactivated). Text tabs on a hairline; the active tab is ink with a 2px
 * blue underline. Arrow keys move between tabs (Radix).
 */
export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...rest }: ComponentPropsWithoutRef<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn("flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]", className)}
      {...rest}
    />
  );
}

export function TabsTrigger({
  count,
  className,
  children,
  ...rest
}: { count?: number; children: ReactNode } & ComponentPropsWithoutRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "-mb-px inline-flex h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-[15px] font-medium whitespace-nowrap text-ink-500",
        "transition-colors duration-(--dur-2) ease-out hover:text-ink-900",
        "data-[state=active]:border-blue-600 data-[state=active]:text-ink-900",
        "disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
      {...rest}
    >
      {children}
      {count !== undefined && (
        <span className="rounded-full bg-mist px-2 py-0.5 text-[12px] tabular-nums text-ink-700">{count}</span>
      )}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({ className, ...rest }: ComponentPropsWithoutRef<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn("pt-5 outline-none", className)} {...rest} />;
}
