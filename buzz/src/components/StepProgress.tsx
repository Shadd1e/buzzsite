import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Progress through a real sequence (DESIGN.md §10.1 partner onboarding:
 * "a progress bar with step names"). Numbers are allowed here because the
 * order matters. Phones show "Step 3 of 7" plus the current name.
 */
export function StepProgress({ steps, current }: { steps: string[]; /** 0-based */ current: number }) {
  const pct = (current / Math.max(steps.length - 1, 1)) * 100;
  return (
    <nav aria-label="Progress">
      {/* Phones */}
      <div className="md:hidden">
        <p className="text-[13px] text-ink-500">
          Step <span className="tabular-nums">{current + 1}</span> of <span className="tabular-nums">{steps.length}</span>
        </p>
        <p className="text-[16px] font-semibold text-ink-900">{steps[current]}</p>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mist" aria-hidden="true">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      {/* Tablet and up */}
      <div className="relative hidden md:block">
        <div aria-hidden="true" className="absolute top-4 right-4 left-4 h-0.5 rounded-full bg-line">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
        <ol className="relative flex justify-between">
          {steps.map((s, i) => {
            const done = i < current;
            const now = i === current;
            return (
              <li
                key={s}
                aria-current={now ? "step" : undefined}
                className="flex w-0 flex-1 flex-col items-center gap-2 text-center first:items-start first:text-left last:items-end last:text-right"
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full text-[13px] font-semibold tabular-nums",
                    done && "bg-blue-600 text-white",
                    now && "bg-blue-600 text-white ring-4 ring-blue-100",
                    !done && !now && "border-[1.5px] border-line-strong bg-white text-ink-500",
                  )}
                >
                  {done ? <Check aria-hidden="true" className="size-4" strokeWidth={2.5} /> : i + 1}
                </span>
                <span className={cn("max-w-[10em] text-[13px] leading-tight", now ? "font-semibold text-ink-900" : "text-ink-500")}>
                  {s}
                  {done && <span className="sr-only"> (done)</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
