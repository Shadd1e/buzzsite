import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * DESIGN.md §8.1: pill, min-height 44px (56px for the main form CTA),
 * 14–16px weight 600. "↗" only on links that leave the current area.
 */
export type ButtonVariant = "solid" | "outline" | "light" | "sky" | "danger" | "ghost";
export type ButtonSize = "md" | "lg" | "sm";

const variantClass: Record<ButtonVariant, string> = {
  solid: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-700",
  outline:
    "border-[1.5px] border-line-strong bg-white text-ink-900 hover:border-ink-900 active:bg-mist",
  // white on the blue band
  light: "bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100",
  // on photos; ink text on sky for contrast (§2.2)
  sky: "bg-sky-400 text-ink-900 hover:bg-white active:bg-blue-50",
  danger: "bg-alert-600 text-white hover:bg-alert-700 active:bg-alert-700",
  // product UI: quiet until hovered
  ghost: "bg-transparent text-ink-900 hover:bg-mist active:bg-blue-50",
};

const sizeClass: Record<ButtonSize, string> = {
  // sm: denser product UI, still a 44px target
  sm:"min-h-11 px-4 text-[14px] gap-1.5",
  md: "min-h-11 px-5 text-[15px] gap-2",
  lg: "min-h-14 px-7 text-[16px] gap-2",
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,transform] duration-(--dur-1) ease-out " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:not-aria-busy:opacity-45 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-45";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Adds "↗". Use only when the link leaves the current area. */
  external?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

function Inner({ icon, loading, external, children }: Omit<CommonProps, "variant" | "size" | "className">) {
  return (
    <>
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-[18px] animate-spin" strokeWidth={1.8} />
      ) : (
        icon
      )}
      <span>{children}</span>
      {external && <span aria-hidden="true">↗</span>}
    </>
  );
}

type ButtonProps = CommonProps & Omit<ComponentPropsWithoutRef<"button">, "children">;

export function Button({
  variant = "solid",
  size = "md",
  external,
  loading,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      // Loading blocks clicks and keys but keeps full colour (see `base`), so it
      // doesn't read as disabled.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variantClass[variant], sizeClass[size], className)}
      {...rest}
    >
      <Inner icon={icon} loading={loading} external={external}>
        {children}
      </Inner>
    </button>
  );
}

type ButtonLinkProps = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "children" | "className"> & {
    disabled?: boolean;
  };

export function ButtonLink({
  variant = "solid",
  size = "md",
  external,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(base, variantClass[variant], sizeClass[size], className)}
      {...rest}
    >
      <Inner icon={icon} external={external}>
        {children}
      </Inner>
    </Link>
  );
}
