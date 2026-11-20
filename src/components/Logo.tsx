import { cn } from "@/lib/cn";

/**
 * Placeholder wordmark until the official logo files arrive (DESIGN.md §7, §13).
 * Swap the internals for the real SVGs; keep the props so call sites don't change.
 *
 * - full:  "Buzz" in --ink-900, for light backgrounds
 * - white: "Buzz" in the on-navy blue (#3D8BFF), for navy backgrounds
 * - mark:  "B" in a Buzz-blue tile, for favicons, avatars and tight spaces
 */
export type LogoVariant = "full" | "mark" | "white";

const sizes = {
  sm: { word: "text-[22px]", mark: "size-8 text-[18px] rounded-tile" },
  md: { word: "text-[28px]", mark: "size-10 text-[22px] rounded-tile" },
  lg: { word: "text-[44px]", mark: "size-14 text-[32px] rounded-field" },
} as const;

export function Logo({
  variant = "full",
  size = "md",
  className,
}: {
  variant?: LogoVariant;
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (variant === "mark") {
    return (
      <span
        role="img"
        aria-label="Buzz"
        data-placeholder="logo"
        className={cn(
          "inline-grid shrink-0 place-items-center bg-blue-600 leading-none font-extrabold tracking-[-0.04em] text-white select-none",
          sizes[size].mark,
          className,
        )}
      >
        <span aria-hidden="true">B</span>
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label="Buzz"
      data-placeholder="logo"
      className={cn(
        "inline-block leading-none font-extrabold tracking-[-0.04em] select-none",
        variant === "white" ? "text-logo-on-navy" : "text-ink-900",
        sizes[size].word,
        className,
      )}
    >
      <span aria-hidden="true">Buzz</span>
    </span>
  );
}
