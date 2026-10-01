export type StatWithDelta = {
  total: number;
  change: number;
  changeLabel: string;
};

export type AnalyticsSummary = {
  months: number;
  stats: {
    totalUsers: StatWithDelta;
    eventsThisMonth: StatWithDelta;
    reportsFiled: StatWithDelta;
    tasksCompleted: StatWithDelta;
  };
  userGrowth: { month: string; value: number }[];
  eventsPerMonth: { month: string; value: number }[];
  volunteersByRegion: { name: string; value: number; color: string }[];
};

export type PerformanceRole = "sro" | "ro" | "youth-leader" | "volunteer";

export type TaskCounts = {
  assigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
};

export type ActivityCounts = { counted: number; completed: number };

export type PerformanceNode = {
  id: string;
  name: string;
  role: PerformanceRole;
  region?: string;
  parentId: string | null;
  childIds: string[];
  ownTasks: TaskCounts;
  teamTasks: TaskCounts;
  /** Ended activities counted, and how many of them were verified. */
  ownActivities: ActivityCounts;
  teamActivities: ActivityCounts;
  teamSize: number;
  /** 0–100, or null when there's nothing to score yet. */
  performance: number | null;
};

export type PerformanceTree = {
  rootIds: string[];
  nodes: Record<string, PerformanceNode>;
  unassignedCount: number;
};

export const ROLE_LABELS: Record<PerformanceRole, { singular: string; plural: string }> = {
  sro: { singular: "SRO", plural: "Senior Reporting Officers" },
  ro: { singular: "RO", plural: "Reporting Officers" },
  "youth-leader": { singular: "Youth Leader", plural: "Youth Leaders" },
  volunteer: { singular: "Volunteer", plural: "Volunteers" },
};

export const RANGE_OPTIONS = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
] as const;

export type RangeOption = (typeof RANGE_OPTIONS)[number]["value"];
