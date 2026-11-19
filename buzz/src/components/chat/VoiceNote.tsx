import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Voice-note content for a Bubble. It's an illustration of the app (not a
 * player), so the play glyph is not a button.
 */
const bars = [6, 12, 18, 10, 22, 14, 8, 16, 24, 12, 6, 14, 20, 10, 16, 8, 12, 18, 10, 6];

export function VoiceNote({ duration, tone = "in" }: { duration: string; tone?: "in" | "out" }) {
  const out = tone === "out";
  return (
    <span className="flex items-center gap-2.5 py-0.5">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full",
          out ? "bg-white text-blue-600" : "bg-blue-600 text-white",
        )}
      >
        <Play className="size-3.5 translate-x-px fill-current" strokeWidth={0} />
      </span>
      <span aria-hidden="true" className="flex h-6 items-center gap-[2px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn("w-[3px] rounded-full", out ? "bg-white/85" : "bg-ink-500/60")}
            style={{ height: h }}
          />
        ))}
      </span>
      <span className="text-[13px] tabular-nums">
        <span className="sr-only">Voice note, </span>
        {duration}
      </span>
    </span>
  );
}
