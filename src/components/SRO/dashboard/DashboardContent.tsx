"use client";

import { useSroData } from "@/hooks/usePortalScope";
import { WelcomeBanner } from "./WelcomeBanner";
import { StatCards } from "./StatCards";
import { MonthlyPerformance } from "./MonthlyPerformance";
import { RoPerformance } from "./RoPerformance";
import { TaskOverview } from "./TaskOverview";
import { RecentReports } from "./RecentReports";
import { RecentNotifications } from "./RecentNotifications";
import { ActivitySummaryPanel } from "@/components/shared/dashboard/ActivitySummaryPanel";
import { PendingRequestsBanner } from "@/components/shared/dashboard/PendingRequestsBanner";
import { DashboardSkeleton } from "@/components/shared/dashboard/DashboardSkeleton";
import type { SRODashboardSummary } from "./dashboard.types";

export function DashboardContent() {
  const {
    data: summary,
    isLoading,
    error: loadError,
    reload: loadSummary,
  } = useSroData<SRODashboardSummary>("/api/dashboard/sro", "Unable to load dashboard.");

  return (
    <div className="flex-1 flex flex-col gap-5">
      <WelcomeBanner />

      {isLoading && !summary && <DashboardSkeleton />}

      {!isLoading && loadError && (
        <div role="alert" className="flex items-center gap-3 text-sm text-red-500">
          {loadError}
          <button type="button" onClick={loadSummary} className="font-medium text-brand hover:underline">
            Retry
          </button>
        </div>
      )}

      {summary && !loadError && (
        <div className={`flex flex-col gap-5 transition-opacity ${isLoading ? "opacity-60" : ""}`}>
          <StatCards stats={summary.stats} />
          <PendingRequestsBanner requests={summary.memberRequests} href="/SRO/youth-leaders" noun="youth leader" />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <MonthlyPerformance data={summary.monthlyActivity} />
            <RoPerformance ros={summary.roPerformance} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TaskOverview overview={summary.taskOverview} upcomingTasks={summary.upcomingTasks} />
            <RecentReports reports={summary.recentReports} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ActivitySummaryPanel activities={summary.activities} activitiesHref="/SRO/activities" title="Team Activities" />
            <RecentNotifications notifications={summary.notifications} unreadCount={summary.unreadNotificationCount} />
          </div>
        </div>
      )}
    </div>
  );
}
