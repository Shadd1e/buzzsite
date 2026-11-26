"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";

/** A screen's data didn't load: say so and offer a retry (DESIGN.md §10.4 error state) */
export function LoadError({ onRetry, message = "This didn't load. Check your connection, then try again." }: { onRetry: () => void; message?: string }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-field border border-line bg-white px-6 py-12 text-center">
      <CircleAlert aria-hidden="true" className="size-6 text-alert-700" strokeWidth={1.8} />
      <p className="max-w-[34em] text-ui text-ink-900">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} icon={<RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
        Try again
      </Button>
    </div>
  );
}
