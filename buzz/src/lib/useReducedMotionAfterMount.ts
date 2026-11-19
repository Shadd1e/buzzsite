"use client";

import { useSyncExternalStore } from "react";

/**
 * prefers-reduced-motion, but `false` during the server render and the
 * hydration pass, then the real value. Use this (not Motion's
 * useReducedMotion) whenever the value changes rendered markup (classes,
 * styles, text): the server can't know the setting, and React leaves
 * mismatched attributes unpatched, which strands the UI in its start state.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotionAfterMount(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
