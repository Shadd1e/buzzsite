"use client";

import { Select as RadixSelect } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Select styled like Input (DESIGN.md §8.1: 52px, 14px radius, 1.5px border,
 * 16px text). Pass the props from <Field> so the label and errors connect.
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Choose one",
  invalid,
  disabled,
  id,
  name,
  required,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  className,
  ...force
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  className?: string;
  "data-force"?: string;
}) {
  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      required={required}
    >
      <RadixSelect.Trigger
        id={id}
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex h-13 w-full items-center justify-between gap-2 rounded-field border-[1.5px] bg-white px-4 text-left text-[16px] text-ink-900",
          "transition-[border-color] duration-(--dur-1) ease-out hover:border-ink-500 focus:border-blue-600",
          "data-[placeholder]:text-ink-500 disabled:cursor-not-allowed disabled:bg-mist disabled:text-ink-500",
          invalid ? "border-alert-600 hover:border-alert-600" : "border-line-strong",
          className,
        )}
        {...force}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown aria-hidden="true" className="size-5 text-ink-500" strokeWidth={1.8} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-[min(360px,var(--radix-select-content-available-height))] w-(--radix-select-trigger-width) overflow-hidden rounded-field border border-line bg-white p-1.5 shadow-float data-[state=open]:animate-dialog-in"
        >
          <RadixSelect.Viewport>
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="relative flex min-h-11 cursor-pointer items-center rounded-tile py-2 pr-9 pl-3 text-[15px] text-ink-900 outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-ink-500 data-[highlighted]:bg-blue-50"
              >
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute right-3">
                  <Check aria-hidden="true" className="size-4 text-blue-600" strokeWidth={2} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
