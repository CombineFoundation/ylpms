"use client";

import { useEffect, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { DashboardStatCards } from "./DashboardStatCards";
import { DashboardCharts } from "./DashboardCharts";
import { DashboardPanels } from "./DashboardPanels";
import type { DashboardSummary } from "./dashboard.types";
import { useReportReview } from "../reports/useReportReview";
import { PageHeader } from "../shared/ListParts";
import { RecentNotifications } from "@/components/SRO/dashboard/RecentNotifications";
import { ActivitySummaryPanel } from "@/components/shared/dashboard/ActivitySummaryPanel";
import { DashboardSkeleton } from "@/components/shared/dashboard/DashboardSkeleton";

export function DashboardContent() {
  const { profile } = useCurrentProfile();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setSummary(await apiFetch<DashboardSummary>("/api/dashboard/head-ro"));
    } catch (error) {
      setLoadError(errorMessage(error, "Unable to load dashboard."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const review = useReportReview((reportId) => {
    setSummary((current) =>
      current
        ? {
            ...current,
            pendingReportCount: Math.max(0, current.pendingReportCount - 1),
            pendingReports: current.pendingReports.filter((report) => report.id !== reportId),
          }
        : current
    );
  });

  const firstName = profile?.name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description={`Welcome back${firstName ? `, ${firstName}` : ""}. Here's what's happening.`}
      />

      {isLoading && <DashboardSkeleton />}

      {!isLoading && loadError && (
        <div role="alert" className="flex items-center gap-3 text-sm text-red-500">
          {loadError}
          <button type="button" onClick={loadSummary} className="font-medium text-brand hover:underline">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !loadError && summary && (
        <>
          <DashboardStatCards stats={summary.stats} />

          <DashboardCharts volunteerGrowth={summary.volunteerGrowth} volunteersByRegion={summary.volunteersByRegion} />

          <DashboardPanels
            pendingReportCount={summary.pendingReportCount}
            pendingReports={summary.pendingReports}
            overdueTaskCount={summary.overdueTaskCount}
            upcomingTasks={summary.upcomingTasks}
            reviewingReportId={review.reviewingId}
            onApproveReport={(report) => review.requestReview(report, "approved")}
            onRejectReport={(report) => review.requestReview(report, "rejected")}
          />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ActivitySummaryPanel activities={summary.activities} eventsHref="/Head-of-RO/activities" title="Program Activities" />
            <RecentNotifications
              notifications={summary.notifications}
              unreadCount={summary.unreadNotificationCount}
              basePath="/Head-of-RO"
            />
          </div>
        </>
      )}
      {review.dialog}
    </div>
  );
}
