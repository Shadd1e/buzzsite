"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Laptop } from "lucide-react";
import { Logo } from "@/components/Logo";
import { webCopy } from "@/content/web";
import type { Chat, PublicParcel, WebNotification, WebUpdate, WebUser } from "@/lib/data/types";
import { ChatApp } from "./ChatApp";
import type { Theme, ThemePref } from "./model";
import { Pairing } from "./Pairing";
import { SessionScreen } from "./SessionScreen";

type Stage = "loading" | "pairing" | "app" | "expired" | "loggedOut";

const LINK_KEY = "buzzweb.linked";
const THEME_KEY = "buzzweb.theme";

/* Storage can be missing or throw (private windows, blocked site data). */
function read(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function write(store: "local" | "session", key: string, value: string | null) {
  try {
    const s = store === "local" ? window.localStorage : window.sessionStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    /* the link simply won't survive a reload */
  }
}

function subscribeDark(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * The Buzz Web client (DESIGN.md §11). Like other web companions to a phone
 * app, the same URL shows the pairing screen until this computer is linked,
 * then the chats. "Keep me signed in" keeps the link in localStorage; without
 * it the link lasts for this tab only (sessionStorage).
 */
export function BuzzWeb(props: {
  me: WebUser;
  chats: Chat[];
  notifications: WebNotification[];
  updates: WebUpdate[];
  tracking: Record<string, PublicParcel>;
}) {
  const [stage, setStage] = useState<Stage>("loading");
  const [themePref, setThemePref] = useState<ThemePref>("system");
  const systemDark = useSyncExternalStore(
    subscribeDark,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
  const theme: Theme = themePref === "system" ? (systemDark ? "dark" : "light") : themePref;

  // Restore the link and theme after mount (storage is client-only)
  useEffect(() => {
    const linked = read("local", LINK_KEY) === "1" || read("session", LINK_KEY) === "1";
    const saved = read("local", THEME_KEY);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from storage */
    if (saved === "light" || saved === "dark" || saved === "system") setThemePref(saved);
    setStage(linked ? "app" : "pairing");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const changeTheme = useCallback((pref: ThemePref) => {
    setThemePref(pref);
    write("local", THEME_KEY, pref);
  }, []);

  const unlink = useCallback((next: "expired" | "loggedOut") => {
    write("local", LINK_KEY, null);
    write("session", LINK_KEY, null);
    setStage(next);
  }, []);

  const linked = useCallback((keep: boolean) => {
    write(keep ? "local" : "session", LINK_KEY, "1");
    setStage("app");
  }, []);

  return (
    <div className="web-shell h-dvh overflow-hidden bg-web-bg text-web-text" data-theme={theme}>
      {/* Phone width: Buzz Web is a computer companion (§11) */}
      <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center md:hidden">
        <Laptop aria-hidden="true" className="size-10 text-blue-600" strokeWidth={1.6} />
        <h1 className="max-w-[16em] text-[24px] leading-tight font-medium">{webCopy.phoneOnly.title}</h1>
        <p className="max-w-[24em] text-[15px] text-web-meta">{webCopy.phoneOnly.body}</p>
        <Link
          href={webCopy.phoneOnly.action.href}
          className="inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-semibold text-blue-600 underline underline-offset-4"
        >
          {webCopy.phoneOnly.action.label}
        </Link>
      </div>

      <div className="hidden h-full md:block">
        {stage === "loading" && (
          <div className="grid h-full place-items-center" aria-busy="true">
            <Logo variant={theme === "dark" ? "white" : "full"} />
          </div>
        )}
        {stage === "pairing" && <Pairing theme={theme} onLinked={linked} />}
        {stage === "app" && (
          <ChatApp
            {...props}
            theme={theme}
            themePref={themePref}
            onThemeChange={changeTheme}
            onLogout={() => unlink("loggedOut")}
            onExpire={() => unlink("expired")}
          />
        )}
        {(stage === "expired" || stage === "loggedOut") && (
          <SessionScreen kind={stage} theme={theme} onRelink={() => setStage("pairing")} />
        )}
      </div>
    </div>
  );
}
