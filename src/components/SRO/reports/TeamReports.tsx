"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortalData, usePortalScope, type ScopedRole } from "@/hooks/usePortalScope";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { ReportsTable } from "@/components/Head-of-RO/reports/ReportsTable";
import { ReportDetailModal } from "@/components/Head-of-RO/reports/ReportDetailModal";
import { useReportReview } from "@/components/Head-of-RO/reports/useReportReview";
import {
  REPORT_STATUS_FILTERS,
  toDisplayReport,
  type ApiReport,
  type ReportStatusFilter,
} from "@/components/Head-of-RO/reports/report-display.types";
import { FilterPills, SearchInput, emptyMessage } from "@/components/Head-of-RO/shared/ListParts";

/**
 * Reports submitted by anyone in the manager's team. Each report is reviewed
 * by its submitter's direct manager (an RO reviews their youth leaders', an SRO
 * their ROs'), who approves it or asks for changes; the rest are view-only here.
 */
export function TeamReports({ portal = "sro", openReportId = null }: { portal?: ScopedRole; openReportId?: string | null }) {
  const { profile } = useCurrentProfile();
  const { selectedId } = usePortalScope(portal);
  // A developer acting in the portal reviews as the person they picked.
  const viewerId = selectedId ?? profile?.id;
  const viewer = viewerId ? { userId: viewerId, role: portal } : null;
  const { data, setData, isLoading, error: loadError } = usePortalData<ApiReport[]>(portal, `/api/${portal}/reports`, "Unable to load reports.");
  const reports = useMemo(() => data ?? [], [data]);
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>("submitted");
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  // Opened from a notification's link (the detail view loads the report itself).
  useEffect(() => {
    if (openReportId) setViewingId(openReportId);
  }, [openReportId]);

  const review = useReportReview((reportId, decision) => {
    setViewingId(null);
    setData((current) => current && current.map((r) => (r.id === reportId ? { ...r, status: decision } : r)));
  });

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    reports.forEach((r) => (byStatus[r.status] = (byStatus[r.status] || 0) + 1));
    return byStatus;
  }, [reports]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports
      .filter((r) => !statusFilter || r.status === statusFilter)
      .map((report) => toDisplayReport(report, viewerId ? { userId: viewerId, role: portal } : null))
      .filter((r) => !q || [r.title, r.submittedBy, r.region].some((value) => value?.toLowerCase().includes(q)));
  }, [reports, statusFilter, search, viewerId, portal]);

  const filterOptions = REPORT_STATUS_FILTERS.map((option) => ({
    value: option.value,
    label: `${option.label} (${option.value ? counts[option.value] || 0 : reports.length})`,
  }));

  return (
    <div className="space-y-6">
      <FilterPills label="Status" options={filterOptions} value={statusFilter} onChange={setStatusFilter} />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:w-96">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by title, submitter or region..." />
        </div>

        <ReportsTable
          reports={filtered}
          isLoading={isLoading}
          error={loadError}
          emptyMessage={emptyMessage({
            isFiltered: !!search.trim() || (!!statusFilter && statusFilter !== "submitted"),
            noun: statusFilter === "submitted" ? "pending reports" : "reports",
          })}
          reviewingId={review.reviewingId}
          hasMore={false}
          isLoadingMore={false}
          onLoadMore={() => {}}
          onView={(report) => setViewingId(report.id)}
          onApprove={(report) => review.requestReview(report, "approved")}
          onReject={(report) => review.requestReview(report, "rejected")}
        />
      </div>

      <ReportDetailModal
        reportId={viewingId}
        onClose={() => setViewingId(null)}
        viewer={viewer}
        onReview={(report, decision) => {
          setViewingId(null);
          review.requestReview(report, decision);
        }}
      />
      {review.dialog}
    </div>
  );
}
