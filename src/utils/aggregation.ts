/** Shared helpers for building simple time-series/breakdown chart data. */

export type MonthBucket = {
  label: string;
  monthStart: Date;
  monthEnd: Date;
};

/** The last N calendar months (oldest first), each with inclusive start/end. */
export function lastNMonths(monthCount: number): MonthBucket[] {
  const now = new Date();
  return Array.from({ length: monthCount }, (_, index) => {
    const offset = monthCount - 1 - index;
    const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59, 999);
    return {
      label: monthStart.toLocaleDateString("en-US", { month: "short" }),
      monthStart,
      monthEnd,
    };
  });
}

/** Normalises a Firestore Timestamp / Date / ISO string to a Date (null if missing or invalid). */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof (value as { toDate?: unknown }).toDate === "function") return (value as { toDate: () => Date }).toDate();
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function startOfMonth(offsetMonths = 0): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
}

/** Cumulative total-as-of-each-month (e.g. running member count). */
export function buildMonthlyCumulative(dates: Date[], monthCount = 7): { month: string; value: number }[] {
  return lastNMonths(monthCount).map(({ label, monthEnd }) => ({
    month: label,
    value: dates.filter((date) => date <= monthEnd).length,
  }));
}

/** Count of items created within each month (not cumulative, e.g. activities held per month). */
export function buildMonthlyCounts(dates: Date[], monthCount = 7): { month: string; value: number }[] {
  return lastNMonths(monthCount).map(({ label, monthStart, monthEnd }) => ({
    month: label,
    value: dates.filter((date) => date >= monthStart && date <= monthEnd).length,
  }));
}

const PALETTE = ["#EA580C", "#FBBF7D", "#1E3A6E", "#F7C9A0", "#2563EB", "#9333EA"];
const OTHER_COLOR = "#9CA3AF";

/**
 * Groups items by region. Keeps the top regions (one palette color each) and
 * folds the rest into "Other" so the chart still adds up to the full total.
 */
export function buildRegionBreakdown(
  items: { region?: string }[],
  maxRegions = PALETTE.length
): { name: string; value: number; color: string }[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const region = item.region?.trim() || "Unassigned";
    counts.set(region, (counts.get(region) || 0) + 1);
  });

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, maxRegions - (sorted.length > maxRegions ? 1 : 0));
  const rest = sorted.slice(top.length);

  const breakdown = top.map(([name, value], index) => ({ name, value, color: PALETTE[index] }));
  if (rest.length > 0) {
    breakdown.push({ name: "Other", value: rest.reduce((sum, [, value]) => sum + value, 0), color: OTHER_COLOR });
  }
  return breakdown;
}
