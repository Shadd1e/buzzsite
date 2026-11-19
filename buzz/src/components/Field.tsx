import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  invalid?: boolean;
  required?: boolean;
}

/**
 * DESIGN.md §8.1: label above (13–14px, 600), help text below, errors in
 * --alert-700 with an icon and fix instructions. Wires up ids and ARIA for the
 * control it renders:
 *
 *   <Field label="Tracking ID" help="It starts with BZT-">
 *     {(props) => <Input {...props} />}
 *   </Field>
 */
export function Field({
  label,
  help,
  error,
  optional,
  required,
  className,
  children,
}: {
  label: string;
  help?: ReactNode;
  /** Say what went wrong and how to fix it. */
  error?: ReactNode;
  optional?: boolean;
  required?: boolean;
  className?: string;
  children: (props: FieldControlProps) => ReactNode;
}) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[14px] font-semibold text-ink-900">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-500">(optional)</span>}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        invalid: !!error,
        required,
      })}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-[14px] leading-snug text-alert-700">
          <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
          <span>{error}</span>
        </p>
      )}
      {help && (
        <p id={helpId} className="text-[13px] leading-normal text-ink-500">
          {help}
        </p>
      )}
    </div>
  );
}
