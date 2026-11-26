"use client";

import { useState, type ReactNode } from "react";

/**
 * The photo panel beside the rider card: a plain <img> filling a navy panel.
 * The image stays hidden until it has actually loaded, so a missing file (the
 * photo isn't in public/ yet) shows the plain panel, not a broken image or its
 * alt text. The panel is navy, not blue, so the blue outgoing bubbles and Buzz
 * avatars on top stay visible without the photo. Bubbles and the pill are
 * children.
 */
export function SignInPhoto({
  src,
  alt,
  className,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`relative min-h-[420px] overflow-hidden rounded-panel bg-navy sm:min-h-[560px] ${className ?? ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a plain <img> was asked for; the file is dropped into public/ */}
      <img
        src={src}
        alt={alt}
        // The image can finish before hydration, when onLoad has already fired
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        // Anchored right: the rider sits on the right of the photo, open sky on the left and top
        className={
          loaded
            ? "absolute inset-0 size-full object-cover object-right"
            : "absolute inset-0 size-full object-cover object-right opacity-0"
        }
      />
      {children}
    </div>
  );
}
