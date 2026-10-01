"use client";

import Link from "next/link";
import { Award, CalendarPlus, CalendarDays, HandHelping, ListChecks, Plus } from "lucide-react";
import { usePortalData } from "@/hooks/usePortalScope";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { MonthlyPerformance } from "@/components/SRO/dashboard/MonthlyPerformance";
import { RoPerformance } from "@/components/SRO/dashboard/RoPerformance";
import { TaskOverview } from "@/components/SRO/dashboard/TaskOverview";
import { RecentNotifications } from "@/components/SRO/dashboard/RecentNotifications";
import { RecentReports } from "@/components/SRO/dashboard/RecentReports";
import { ActivitySummaryPanel } from "@/components/shared/dashboard/ActivitySummaryPanel";
import { PendingRequestsBanner } from "@/components/shared/dashboard/PendingRequestsBanner";
import { DashboardSkeleton } from "@/components/shared/dashboard/DashboardSkeleton";
import { ActivityPipeline } from "./ActivityPipeline";
import type { YouthLeaderDashboardSummary } from "./dashboard.types";

function WelcomeBanner() {
  const { profile } = useCurrentProfile();
  const firstName = profile?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
        <p className="mt-1 text-sm text-slate-400">Lead your volunteers, run activities and track your progress.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/youth-leader/tasks?new=1"
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} />
          Assign Task
        </Link>
        <Link
          href="/youth-leader/activities"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <CalendarPlus size={15} />
          Activities
        </Link>
      </div>
    </div>
  );
}

function StatCards({ summary }: { summary: YouthLeaderDashboardSummary }) {
  const { stats, pipeline, certificates } = summary;
  const cards = [
    { label: "MY VOLUNTEERS", value: stats.volunteers, sub: "Reporting to you", icon: HandHelping, accent: "bg-orange-100 text-orange-500" },
    {
      label: "ACTIVE TASKS",
      value: stats.activeTasks,
      sub: stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : "None overdue",
      icon: ListChecks,
      accent: "bg-blue-100 text-blue-500",
    },
    {
      label: "UPCOMING ACTIVITIES",
      value: pipeline.upcoming,
      sub: pipeline.awaitingApproval > 0 ? `${pipeline.awaitingApproval} awaiting approval` : "Approved and scheduled",
      icon: CalendarDays,
      accent: "bg-emerald-100 text-emerald-500",
    },
    { label: "CERTIFICATES", value: certificates, sub: "Earned so far", icon: Award, accent: "bg-amber-100 text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
            <card.icon size={17} />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-wide text-slate-400">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{card.value}</p>
          <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function DashboardContent() {
  const { data: summary, isLoading, error, reload } = usePortalData<YouthLeaderDashboardSummary>(
    "youth-leader",
    "/api/dashboard/youth-leader",
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
          <StatCards summary={summary} />
          <PendingRequestsBanner requests={summary.memberRequests} href="/youth-leader/volunteers" noun="volunteer" />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <MonthlyPerformance data={summary.monthlyActivity} reportsLabel="My reports submitted" />
            <RoPerformance
              ros={summary.leadPerformance}
              title="Volunteer Performance"
              emptyText="No volunteers reporting to you yet."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TaskOverview overview={summary.taskOverview} upcomingTasks={summary.upcomingTasks} basePath="/youth-leader" />
            <ActivityPipeline activities={summary.pipeline} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ActivitySummaryPanel
              activities={summary.activities}
              eventsHref="/youth-leader/activities"
              showReview={false}
              title="Upcoming Activities"
            />
            <RecentReports
              reports={summary.recentReports}
              basePath="/youth-leader"
              title="My Recent Reports"
              emptyText="You haven't submitted a report yet. Send one to your SRO from the Reports page."
            />
          </div>

          <RecentNotifications
            notifications={summary.notifications}
            unreadCount={summary.unreadNotificationCount}
            basePath="/youth-leader"
          />
        </div>
      )}
    </div>
  );
}
