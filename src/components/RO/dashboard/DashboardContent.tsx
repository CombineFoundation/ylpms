"use client";

import Link from "next/link";
import { CalendarDays, FileText, Plus } from "lucide-react";
import { usePortalData } from "@/hooks/usePortalScope";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { MonthlyPerformance } from "@/components/SRO/dashboard/MonthlyPerformance";
import { RoPerformance } from "@/components/SRO/dashboard/RoPerformance";
import { TaskOverview } from "@/components/SRO/dashboard/TaskOverview";
import { RecentReports } from "@/components/SRO/dashboard/RecentReports";
import { RecentNotifications } from "@/components/SRO/dashboard/RecentNotifications";
import { ActivitySummaryPanel } from "@/components/shared/dashboard/ActivitySummaryPanel";
import { PendingRequestsBanner } from "@/components/shared/dashboard/PendingRequestsBanner";
import { DashboardSkeleton } from "@/components/shared/dashboard/DashboardSkeleton";
import { StatCards } from "./StatCards";
import type { RODashboardSummary } from "./dashboard.types";

function WelcomeBanner() {
  const { profile } = useCurrentProfile();
  const firstName = profile?.name?.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
        <p className="mt-1 text-sm text-slate-400">Track your youth leaders, volunteers, tasks and reports.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="hidden text-xs text-slate-400 sm:block">{today}</span>
        <Link
          href="/RO/tasks?new=1"
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} />
          Assign Task
        </Link>
        <Link
          href="/RO/reports"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <FileText size={15} />
          Reports
        </Link>
        <Link
          href="/RO/activities"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <CalendarDays size={15} />
          Review Activities
        </Link>
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { data: summary, isLoading, error, reload } = usePortalData<RODashboardSummary>(
    "ro",
    "/api/dashboard/ro",
    "Unable to load dashboard."
  );

  return (
    <div className="flex flex-1 flex-col gap-5">
      <WelcomeBanner />

      {isLoading && !summary && <DashboardSkeleton />}

      {!isLoading && error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-red-500">
          {error}
          <button type="button" onClick={reload} className="font-medium text-orange-500 hover:underline">
            Retry
          </button>
        </div>
      )}

      {summary && !error && (
        <div className={`flex flex-col gap-5 transition-opacity ${isLoading ? "opacity-60" : ""}`}>
          <StatCards stats={summary.stats} />
          <PendingRequestsBanner requests={summary.memberRequests} href="/RO/volunteers" noun="volunteer" />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <MonthlyPerformance data={summary.monthlyActivity} />
            <RoPerformance
              ros={summary.leadPerformance}
              title="Youth Leader Performance"
              emptyText="No youth leaders reporting to you yet."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TaskOverview overview={summary.taskOverview} upcomingTasks={summary.upcomingTasks} basePath="/RO" />
            <RecentReports reports={summary.recentReports} basePath="/RO" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ActivitySummaryPanel activities={summary.activities} eventsHref="/RO/activities" title="Team Activities" />
            <RecentNotifications
              notifications={summary.notifications}
              unreadCount={summary.unreadNotificationCount}
              basePath="/RO"
            />
          </div>
        </div>
      )}
    </div>
  );
}
