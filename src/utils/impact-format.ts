import { formatDate } from "./format-date";

/** Exact counts for the public pages, e.g. 1,099. */
export const formatCount = (value: number) => value.toLocaleString("en-US");

/** Estimates like digital reach, e.g. 5K+ or 1.2M+. */
export function formatReach(value: number) {
  if (value >= 1_000_000) return `${trim(value / 1_000_000)}M+`;
  if (value >= 1_000) return `${trim(value / 1_000)}K+`;
  return formatCount(value);
}

const trim = (value: number) => (Math.floor(value * 10) / 10).toString().replace(/\.0$/, "");

/** "15 Jan 2026" in Pakistan time, from an ISO string or YYYY-MM-DD. */
export function formatProgramDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+05:00`) : new Date(value);
  return formatDate(date);
}
