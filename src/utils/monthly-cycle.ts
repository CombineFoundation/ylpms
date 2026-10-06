/**
 * Program months run from the cohort's start day to the same day next month,
 * Pakistan time (UTC+5, no daylight saving) — the 15th → 15th for YLP 2.0,
 * whose Month 1 starts Sep 15, 2026. Each cohort starts again at Month 1.
 * Kept free of server-only imports so the UI can label months the same way.
 */

import { formatDate } from "./format-date";

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The cohort a cycle belongs to. Defaults to YLP 2.0 (Sep 15, 2026 – Mar 15, 2027). */
export type CycleCohort = { id: string; startDate: Date; endDate: Date };

const YLP_2: CycleCohort = {
  id: "ylp-2",
  startDate: startOfPktDay("2026-09-15"),
  endDate: endOfPktDay("2027-03-15"),
};

export type MonthlyCycle = {
  number: number;
  /** Stored on each monthly task, e.g. "month-1" (YLP 2.0) or "ylp-3-month-1". */
  key: string;
  label: string;
  start: Date;
  /** End of the next cycle day (Pakistan time) — the default deadline. */
  end: Date;
  rangeLabel: string;
};

/** The cohort's first day as a Pakistan calendar date. */
function pktStart(cohort: CycleCohort) {
  const pkt = new Date(cohort.startDate.getTime() + PKT_OFFSET_MS);
  return { year: pkt.getUTCFullYear(), monthIndex: pkt.getUTCMonth(), day: pkt.getUTCDate() };
}

/** Midnight PKT on the cycle day, `monthsAfterStart` months after the cohort start. */
const cycleBoundary = (cohort: CycleCohort, monthsAfterStart: number) => {
  const start = pktStart(cohort);
  return new Date(Date.UTC(start.year, start.monthIndex + monthsAfterStart, start.day) - PKT_OFFSET_MS);
};

const shortDate = (date: Date) => formatDate(date);

export function cycleByNumber(number: number, cohort: CycleCohort = YLP_2): MonthlyCycle {
  const start = cycleBoundary(cohort, number - 1);
  const end = new Date(cycleBoundary(cohort, number).getTime() + DAY_MS - 1);
  return {
    number,
    // YLP 2.0 keeps its original keys so tasks assigned before cohorts existed still match.
    key: cohort.id === YLP_2.id ? `month-${number}` : `${cohort.id}-month-${number}`,
    label: `Month ${number}`,
    start,
    end,
    rangeLabel: `${shortDate(start)} – ${shortDate(end)}`,
  };
}

/** The program month containing `date`, or null before the cohort starts or after it ends. */
export function currentCycle(date = new Date(), cohort: CycleCohort = YLP_2): MonthlyCycle | null {
  if (date < cohort.startDate || date > cohort.endDate) return null;
  const start = pktStart(cohort);
  const pkt = new Date(date.getTime() + PKT_OFFSET_MS);
  let months = (pkt.getUTCFullYear() - start.year) * 12 + (pkt.getUTCMonth() - start.monthIndex);
  if (pkt.getUTCDate() < start.day) months -= 1;
  return months < 0 ? null : cycleByNumber(months + 1, cohort);
}

/** "YYYY-MM-DD" → midnight at the start of that day, Pakistan time. */
export function startOfPktDay(dateValue: string): Date {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) - PKT_OFFSET_MS);
}

/** "YYYY-MM-DD" → the end of that day, Pakistan time. */
export function endOfPktDay(dateValue: string): Date {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1) - PKT_OFFSET_MS - 1);
}

/** A date → "YYYY-MM-DD" in Pakistan time. */
export function toPktDateValue(date: Date): string {
  return new Date(date.getTime() + PKT_OFFSET_MS).toISOString().slice(0, 10);
}
