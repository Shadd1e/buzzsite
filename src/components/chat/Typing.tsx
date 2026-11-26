import { cn } from "@/lib/cn";
import { Avatar, type Sender } from "./Avatar";
import type { ChatTheme } from "./Bubble";

/** DESIGN.md §5.1 `typing` variant: three dots in an incoming bubble. */
export function Typing({
  sender,
  onTint,
  glass,
  theme = "light",
  className,
}: {
  sender: Sender;
  onTint?: boolean;
  glass?: boolean;
  theme?: ChatTheme;
  className?: string;
}) {
  const dark = theme === "dark";
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <Avatar sender={sender} size="md" decorative />
      <div
        role="status"
        aria-label={`${sender.name} is typing`}
        className={cn(
          "flex h-10 items-center gap-1 rounded-card rounded-bl-tag px-4",
          dark ? "bg-dark-bubble-in" : glass ? "glass border border-line shadow-hair" : "bg-white",
          onTint && !glass && !dark && "shadow-hair",
        )}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn("size-1.5 rounded-full motion-safe:animate-typing", dark ? "bg-dark-meta" : "bg-ink-500")}
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
