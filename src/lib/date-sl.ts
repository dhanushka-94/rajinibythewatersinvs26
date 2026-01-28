/**
 * Sri Lanka (Asia/Colombo, UTC+5:30) date/time formatting.
 * Use these helpers everywhere we display dates or times to users.
 */

const TZ = "Asia/Colombo";

/**
 * Format date only (e.g. "Jan 15, 2025") in Sri Lanka time.
 */
export function formatDateSL(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: TZ,
    ...options,
  });
}

/**
 * Format date and time (e.g. "1/15/2025, 2:30:00 PM") in Sri Lanka time.
 */
export function formatDateTimeSL(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: TZ,
    ...options,
  });
}

/**
 * Format time only (e.g. "2:30:00 PM") in Sri Lanka time.
 */
export function formatTimeSL(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: TZ,
    ...options,
  });
}

/**
 * Today's date in Sri Lanka, as YYYY-MM-DD (for date inputs, comparisons).
 */
export function todaySL(): string {
  const d = new Date();
  return d.toLocaleDateString("en-CA", { timeZone: TZ }); // en-CA => YYYY-MM-DD
}

/**
 * Today's date parts in Sri Lanka (for calendar "today" highlight, etc.).
 * month is 0-indexed (JS Date convention).
 */
export function getTodaySLParts(): { year: number; month: number; day: number } {
  const [y, m, d] = todaySL().split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

/**
 * Format a Date as local YYYY-MM-DD (no timezone shift).
 * Use for calendar day keys and date comparisons when using local dates.
 */
export function toDateStrLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Format a Date as ISO string in Sri Lanka time (e.g. "2025-01-24T14:30:00+05:30").
 * Use for persisting timestamps to the database.
 */
export function toISOStringSL(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (id: string) =>
    parts.find((p) => p.type === id)?.value ?? "";
  const y = get("year");
  const mo = get("month");
  const day = get("day");
  const h = get("hour");
  const min = get("minute");
  const sec = get("second");
  return `${y}-${mo}-${day}T${h}:${min}:${sec}+05:30`;
}

/**
 * Current time as ISO string in Sri Lanka time.
 * Use wherever we persist "now" (created_at, updated_at, etc.).
 */
export function nowISOStringSL(): string {
  return toISOStringSL(new Date());
}
