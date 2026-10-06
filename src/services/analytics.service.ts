import type { Timestamp } from "firebase-admin/firestore";
import { getDocCount, selectFields, type Filter } from "@/utils/firestore";
import { buildRegionBreakdown, lastNMonths, startOfMonth, toDate } from "@/utils/aggregation";
import { logger } from "@/utils/errors";

export const ANALYTICS_RANGES = [3, 6, 12] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export interface StatWithDelta {
  total: number;
  /** Change shown under the number, described by `changeLabel`. */
  change: number;
  changeLabel: string;
}

export interface HeadROAnalyticsSummary {
  months: number;
  stats: {
    totalUsers: StatWithDelta;
    activitiesThisMonth: StatWithDelta;
    reportsFiled: StatWithDelta;
    tasksCompleted: StatWithDelta;
  };
  userGrowth: { month: string; value: number }[];
  activitiesPerMonth: { month: string; value: number }[];
  volunteersByRegion: { name: string; value: number; color: string }[];
}

/** Users excluding developer accounts, created on/before `until` (or ever). */
async function countNonDeveloperUsers(until?: Date, since?: Date): Promise<number> {
  // Firestore can't combine role != developer with a createdAt range without
  // an extra index, so count everyone in range and subtract developers.
  const range: Filter[] = [
    ...(until ? [{ field: "createdAt", operator: "<=", value: until } as Filter] : []),
    ...(since ? [{ field: "createdAt", operator: ">=", value: since } as Filter] : []),
  ];
  const [all, developers] = await Promise.all([
    getDocCount("users", range),
    getDocCount("users", [{ field: "role", operator: "==", value: "developer" }, ...range]),
  ]);
  return all - developers;
}

/** Activities that actually got scheduled (not drafts, rejected proposals or ones still awaiting approval). */
const SCHEDULED_ACTIVITY_STATUSES = ["planned", "ongoing", "evidence-submitted", "completed", "cancelled"];

function countActivitiesStartingBetween(start: Date, end: Date) {
  // Uses the activities (status, startDate) composite index.
  return getDocCount("events", [
    { field: "status", operator: "in", value: SCHEDULED_ACTIVITY_STATUSES },
    { field: "startDate", operator: ">=", value: start },
    { field: "startDate", operator: "<=", value: end },
  ]);
}

/**
 * Aggregates the org-wide analytics summary for Head RO / developer, over the
 * last `months` calendar months. Uses count() aggregates rather than reading
 * whole collections.
 */
export async function getHeadROAnalyticsSummary(months: AnalyticsRange = 6): Promise<HeadROAnalyticsSummary> {
  try {
    const buckets = lastNMonths(months);
    const thisMonth = buckets[buckets.length - 1];
    const lastMonthStart = startOfMonth(-1);
    const lastMonthEnd = new Date(thisMonth.monthStart.getTime() - 1);

    const [
      totalUsers,
      newUsersThisMonth,
      activitiesThisMonth,
      activitiesLastMonth,
      allReports,
      draftReports,
      reportsThisMonth,
      draftDates,
      tasksCompleted,
      tasksCompletedThisMonth,
      userGrowth,
      activitiesPerMonth,
      volunteerRegions,
    ] = await Promise.all([
      countNonDeveloperUsers(),
      countNonDeveloperUsers(undefined, thisMonth.monthStart),
      countActivitiesStartingBetween(thisMonth.monthStart, thisMonth.monthEnd),
      countActivitiesStartingBetween(lastMonthStart, lastMonthEnd),
      getDocCount("reports"),
      getDocCount("reports", [{ field: "status", operator: "==", value: "draft" }]),
      getDocCount("reports", [{ field: "createdAt", operator: ">=", value: thisMonth.monthStart }]),
      // status == draft + createdAt range would need a composite index, so read
      // just the drafts' createdAt (drafts are few) and filter in memory.
      selectFields<{ createdAt?: Timestamp | Date }>(
        "reports",
        [{ field: "status", operator: "==", value: "draft" }],
        ["createdAt"]
      ),
      getDocCount("tasks", [{ field: "status", operator: "==", value: "completed" }]),
      getDocCount("tasks", [
        { field: "status", operator: "==", value: "completed" },
        { field: "completedDate", operator: ">=", value: thisMonth.monthStart },
      ]),
      Promise.all(buckets.map(({ monthEnd }) => countNonDeveloperUsers(monthEnd))),
      Promise.all(buckets.map(({ monthStart, monthEnd }) => countActivitiesStartingBetween(monthStart, monthEnd))),
      selectFields<{ region?: string }>("users", [{ field: "role", operator: "==", value: "volunteer" }], ["region"]),
    ]);

    const draftsThisMonth = draftDates.filter(({ createdAt }) => {
      const created = toDate(createdAt);
      return created !== null && created >= thisMonth.monthStart;
    }).length;

    return {
      months,
      stats: {
        totalUsers: { total: totalUsers, change: newUsersThisMonth, changeLabel: "this month" },
        activitiesThisMonth: {
          total: activitiesThisMonth,
          change: activitiesThisMonth - activitiesLastMonth,
          changeLabel: "vs last month",
        },
        // Drafts haven't been filed yet, so they don't count.
        reportsFiled: {
          total: allReports - draftReports,
          change: reportsThisMonth - draftsThisMonth,
          changeLabel: "this month",
        },
        tasksCompleted: { total: tasksCompleted, change: tasksCompletedThisMonth, changeLabel: "this month" },
      },
      userGrowth: buckets.map(({ label }, index) => ({ month: label, value: userGrowth[index] })),
      activitiesPerMonth: buckets.map(({ label }, index) => ({ month: label, value: activitiesPerMonth[index] })),
      volunteersByRegion: buildRegionBreakdown(volunteerRegions),
    };
  } catch (error) {
    logger.error("Error building Head RO analytics summary", error);
    throw error;
  }
}
