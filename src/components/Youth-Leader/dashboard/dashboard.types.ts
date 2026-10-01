import type { RODashboardSummary } from "@/components/RO/dashboard/dashboard.types";

/**
 * GET /api/dashboard/youth-leader — the team widgets (`leads` are volunteers;
 * `recentReports` are the youth leader's own) plus their activity pipeline.
 */
export type YouthLeaderDashboardSummary = RODashboardSummary & {
  pipeline: {
    drafts: number;
    awaitingApproval: number;
    upcoming: number;
    awaitingVerification: number;
    completed: number;
    needsChanges: number;
  };
  certificates: number;
};
