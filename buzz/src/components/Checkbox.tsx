"use client";

import { useId, type ReactNode } from "react";
import { Checkbox as RadixCheckbox, Switch as RadixSwitch } from "radix-ui";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Checkbox and Switch with their labels. The whole row is the 44px target.
 * Checkbox: "We confirm our company is registered and verified" (§10.1),
 * company verification checklists (§10.2). Switch: settings that apply at
 * once, e.g. "Keep me signed in" (§11).
 */
export function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  invalid,
  className,
}: {
  label: ReactNode;
  description?: ReactNode;
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-h-11 items-start gap-3 py-2.5", disabled && "opacity-45", className)}>
      <RadixCheckbox.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={description ? `${id}-d` : undefined}
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-tag border-[1.5px] bg-white",
          "transition-colors duration-(--dur-1) ease-out",
          "data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:bg-blue-600",
          invalid ? "border-alert-600" : "border-line-strong hover:border-ink-500",
        )}
      >
        <RadixCheckbox.Indicator className="text-white">
          {checked === "indeterminate" ? (
            <Minus aria-hidden="true" className="size-3.5" strokeWidth={3} />
          ) : (
            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
          )}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <div className="-mt-0.5 min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[15px] leading-snug text-ink-900">
          {label}
        </label>
        {description && (
          <p id={`${id}-d`} className="mt-0.5 text-[13px] text-ink-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function Switch({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
}: {
  label: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-h-11 items-center justify-between gap-4 py-1.5", disabled && "opacity-45", className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[15px] text-ink-900">
          {label}
        </label>
        {description && (
          <p id={`${id}-d`} className="text-[13px] text-ink-500">
            {description}
          </p>
        )}
      </div>
      <RadixSwitch.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-d` : undefined}
        className="relative h-7 w-12 shrink-0 rounded-full bg-line-strong transition-colors duration-(--dur-2) ease-out data-[state=checked]:bg-blue-600"
      >
        <RadixSwitch.Thumb className="block size-6 translate-x-0.5 rounded-full bg-white shadow-hair transition-transform duration-(--dur-2) ease-out data-[state=checked]:translate-x-[22px]" />
      </RadixSwitch.Root>
    </div>
  );
}
