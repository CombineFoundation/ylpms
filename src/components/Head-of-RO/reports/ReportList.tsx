"use client";

import { useEffect, useMemo, useState } from "react";
import { useDeepLinkId } from "@/hooks/useDeepLinkId";
import { Download } from "lucide-react";
import { getAuthToken, errorMessage } from "@/lib/api-client";
import { useLoadAllWhileSearching, usePagedList } from "@/hooks/usePagedList";
import { ReportsTable } from "./ReportsTable";
import { ReportDetailModal } from "./ReportDetailModal";
import { useReportReview } from "./useReportReview";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import {
  REPORT_STATUS_FILTERS,
  toDisplayReport,
  type ApiReport,
  type ReportStatusFilter,
} from "./report-display.types";
import { ActionErrorBanner, FilterPills, PageHeader, SearchInput, emptyMessage } from "../shared/ListParts";

export function ReportList() {
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>("submitted");
  const list = usePagedList<ApiReport>(
    (page) => `/api/reports?${statusFilter ? `status=${statusFilter}&` : ""}pageSize=50&pageNumber=${page}`,
    `reports:${statusFilter}`,
    "Unable to load reports."
  );
  const { profile } = useCurrentProfile();
  const viewer = profile ? { userId: profile.id, role: profile.role } : null;
  // Head RO reviews SROs' reports (and anyone without a manager); the rest go to their own manager.
  const reports = useMemo(
    () => list.items.map((report) => toDisplayReport(report, profile ? { userId: profile.id, role: profile.role } : null)),
    [list.items, profile]
  );

  const [search, setSearch] = useState("");
  // Search runs on the client, so fetch the remaining pages while searching.
  useLoadAllWhileSearching(list, search);
  const [viewingId, setViewingId] = useState<string | null>(null);
  // A notification's link (?reportId=) opens that report.
  const [linkedReportId, consumeLinkedReport] = useDeepLinkId("reportId");
  useEffect(() => {
    if (!linkedReportId) return;
    setViewingId(linkedReportId);
    consumeLinkedReport();
  }, [linkedReportId, consumeLinkedReport]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const review = useReportReview((reportId, decision) => {
    setViewingId(null);
    // Drop it from a status-filtered view it no longer matches; otherwise update in place.
    list.setItems((current) =>
      statusFilter && statusFilter !== decision
        ? current.filter((r) => r.id !== reportId)
        : current.map((r) => (r.id === reportId ? { ...r, status: decision } : r))
    );
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => [r.title, r.submittedBy, r.region].some((value) => value?.toLowerCase().includes(q)));
  }, [reports, search]);

  const exportCsv = async () => {
    setIsExporting(true);
    setActionError(null);
    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/reports/export${statusFilter ? `?status=${statusFilter}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error?.message || "Unable to export reports.");
      }
      const blob = await response.blob();
      const filename =
        response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] || "reports.csv";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(errorMessage(error, "Unable to export reports."));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Review and approve submitted reports." />

      <FilterPills label="Status" options={REPORT_STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
      <ActionErrorBanner message={actionError} onDismiss={() => setActionError(null)} />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:w-80">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by title, submitter or region..." />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            <Download size={13} />
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        <ReportsTable
          reports={filtered}
          isLoading={list.isLoading}
          error={list.error}
          emptyMessage={emptyMessage({
            // "Pending" has its own noun; any other status pill is a filter.
            isFiltered: !!search.trim() || (!!statusFilter && statusFilter !== "submitted"),
            noun: statusFilter === "submitted" ? "pending reports" : "reports",
          })}
          reviewingId={review.reviewingId}
          hasMore={list.hasMore}
          isLoadingMore={list.isLoadingMore}
          onLoadMore={list.loadMore}
          onView={(report) => setViewingId(report.id)}
          onApprove={(report) => review.requestReview(report, "approved")}
          onReject={(report) => review.requestReview(report, "rejected")}
        />
      </div>

      <ReportDetailModal
        reportId={viewingId}
        viewer={viewer}
        onClose={() => setViewingId(null)}
        onReview={(report, decision) => {
          setViewingId(null);
          review.requestReview(report, decision);
        }}
      />
      {review.dialog}
    </div>
  );
}
