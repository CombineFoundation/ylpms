import type { SRODashboardSummary } from "@/components/SRO/dashboard/dashboard.types";

/** GET /api/dashboard/ro — same widgets as the SRO dashboard; `leads` are youth leaders. */
export type RODashboardSummary = Omit<SRODashboardSummary, "stats" | "roPerformance"> & {
  stats: {
    leads: number;
    youthLeaders: number;
    volunteers: number;
    pendingReports: number;
    activeTasks: number;
    overdueTasks: number;
  };
  leadPerformance: SRODashboardSummary["roPerformance"];
};
