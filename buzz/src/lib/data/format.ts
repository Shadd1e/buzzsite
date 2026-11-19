/**
 * Formatting rules from DESIGN.md §10.4: money is always ₦ with thousands
 * separators; dates read "19 Nov 2026, 14:05 WAT". Everything is shown in WAT
 * (Africa/Lagos) whatever the viewer's timezone, so server and client agree.
 */

const TZ = "Africa/Lagos";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number): string {
  return naira.format(amount);
}

const datePart = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TZ,
});

const timePart = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

/** "19 Nov 2026, 14:05 WAT" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${datePart.format(d)}, ${timePart.format(d)} WAT`;
}

/** "19 Nov 2026" */
export function formatDate(iso: string): string {
  return datePart.format(new Date(iso));
}

/** "14:05" for chat bubbles and timelines */
export function formatTime(iso: string): string {
  return timePart.format(new Date(iso));
}
