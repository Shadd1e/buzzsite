import { LogOut, TimerOff } from "lucide-react";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { webCopy } from "@/content/web";
import type { Theme } from "./model";

/** Session expired and logged-out states (DESIGN.md §11). */
export function SessionScreen({
  kind,
  theme,
  onRelink,
}: {
  kind: "expired" | "loggedOut";
  theme: Theme;
  onRelink: () => void;
}) {
  const copy = kind === "expired" ? webCopy.session.expired : webCopy.session.loggedOut;
  const Icon = kind === "expired" ? TimerOff : LogOut;
  return (
    <div className="flex h-full flex-col">
      <header className="px-8 pt-6">
        <Logo variant={theme === "dark" ? "white" : "full"} />
      </header>
      <div className="grid flex-1 place-items-center px-6 pb-16">
        <div className="flex max-w-[440px] flex-col items-center rounded-convo bg-web-surface p-10 text-center">
          <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-blue-50 text-blue-600">
            <Icon className="size-6" strokeWidth={1.8} />
          </span>
          <h1 className="mt-5 text-[28px] leading-tight font-medium">{copy.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-web-meta">{copy.body}</p>
          <Button onClick={onRelink} className="mt-7">
            {copy.action}
          </Button>
        </div>
      </div>
    </div>
  );
}
