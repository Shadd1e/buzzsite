"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/Input";

/**
 * Password field with a show/hide toggle (DESIGN.md §8.1 input). The toggle
 * is a 44px target inside the field's right edge and says what it will do.
 * Use inside <Field> like <Input>.
 */
export function PasswordInput({
  invalid,
  className,
  ...rest
}: { invalid?: boolean } & Omit<ComponentPropsWithoutRef<"input">, "type">) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input {...rest} invalid={invalid} type={shown ? "text" : "password"} className={className ? `pr-14 ${className}` : "pr-14"} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        aria-controls={rest.id}
        className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full text-ink-500 transition-colors duration-(--dur-1) ease-out hover:text-ink-900"
      >
        {shown ? (
          <EyeOff aria-hidden="true" className="size-5" strokeWidth={1.8} />
        ) : (
          <Eye aria-hidden="true" className="size-5" strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}
