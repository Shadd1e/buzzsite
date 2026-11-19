"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { ToastProvider } from "./Toast";

/**
 * App-wide client providers.
 * - MotionConfig reducedMotion="user": Motion drops transform animations when
 *   the OS asks for reduced motion (§6.2 rule 5). CSS animations are handled
 *   by the reduced-motion rule in globals.css.
 * - ToastProvider: useToast() anywhere below.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
