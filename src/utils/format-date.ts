/**
 * The app's one date style: "5 Oct 2026", always in Pakistan time, so the
 * browser's locale or the server's time zone can't change the day shown.
 * Used on both the client and the server (notifications, emails).
 */

const PKT = "Asia/Karachi";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: PKT });
const longDateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: PKT });
const dayMonthFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: PKT });
const monthYearFormat = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: PKT });
const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: PKT });
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: PKT });

/** Shown when there's no date. */
export const NO_DATE = "—";

const isValid = (date: Date | null | undefined): date is Date => !!date && !Number.isNaN(date.getTime());

/** "5 Oct 2026"; `long` gives "5 October 2026". */
export function formatDate(date: Date | null | undefined, options: { long?: boolean } = {}): string {
  if (!isValid(date)) return NO_DATE;
  return (options.long ? longDateFormat : dateFormat).format(date);
}

/** "5 Oct" — for recent dates where the year is obvious. */
export function formatDayMonth(date: Date | null | undefined): string {
  return isValid(date) ? dayMonthFormat.format(date) : NO_DATE;
}

/** "Oct 2026". */
export function formatMonthYear(date: Date | null | undefined): string {
  return isValid(date) ? monthYearFormat.format(date) : NO_DATE;
}

/** "3:30 pm". */
export function formatTime(date: Date | null | undefined): string {
  return isValid(date) ? timeFormat.format(date) : NO_DATE;
}

/** Whether two moments fall on the same calendar day in Pakistan. */
export function isSamePktDay(a: Date, b: Date): boolean {
  return dayKeyFormat.format(a) === dayKeyFormat.format(b);
}
