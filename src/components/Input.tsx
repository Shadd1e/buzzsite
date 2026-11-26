import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1: 52px tall, 14px radius, 1.5px #CBD3E1 border,
 * 16px text (prevents iOS zoom). Use inside <Field> for label, help and error.
 */
export function Input({
  invalid,
  className,
  ...rest
}: { invalid?: boolean } & ComponentPropsWithoutRef<"input">) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "block h-13 w-full rounded-field border-[1.5px] bg-white px-4 text-[16px] text-ink-900",
        "placeholder:text-ink-500 transition-[border-color,box-shadow] duration-(--dur-1) ease-out",
        // Keyboard and mouse focus both get the global 3px sky ring (§12). The
        // border keeps its colour: a blue border inside the ring read as a
        // heavy double outline.
        "hover:border-ink-500 focus:outline-3 focus:outline-offset-3 focus:outline-sky-400",
        "disabled:cursor-not-allowed disabled:bg-mist disabled:text-ink-500 disabled:hover:border-line-strong",
        // Read-only: white with a dashed border (you can select and copy it).
        // Disabled: grey fill, muted text (not available right now).
        "read-only:border-dashed read-only:hover:border-line-strong read-only:focus:border-ink-500",
        invalid
          ? "border-alert-600 hover:border-alert-600 focus:border-alert-600"
          : "border-line-strong",
        className,
      )}
      {...rest}
    />
  );
}
