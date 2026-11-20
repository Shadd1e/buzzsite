/**
 * Tracking ID helpers with no fixture imports, so client components (the
 * tracking form) can use them without bundling the mock data.
 */

/** Tracking IDs look like BZT-7Q4K-19XM. */
export const TRACKING_ID_PATTERN = /^BZT-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function normaliseTrackingId(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
