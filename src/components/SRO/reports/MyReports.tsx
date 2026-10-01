"use client";

import { useState } from "react";
import { Eye, Paperclip } from "lucide-react";
import { TableMessageRow } from "@/components/Head-of-RO/shared/ListParts";
import { ReportDetailModal } from "@/components/Head-of-RO/reports/ReportDetailModal";
import {
  formatReportDate,
  reportTypeLabels,
  statusStyles,
  type ApiReport,
} from "@/components/Head-of-RO/reports/report-display.types";
import type { ReportStatus } from "@/types/report.types";

/** From the submitter's side, "submitted" means it's waiting on their reviewer. */
const myStatusLabels = (reviewer: string): Record<ReportStatus, string> => ({
  draft: "Draft",
  submitted: `Awaiting ${reviewer}`,
  reviewed: "Under review",
  approved: "Approved",
  rejected: "Returned",
});

type MyReportsProps = {
  reports: ApiReport[];
  isLoading: boolean;
  error: string | null;
  /** Who reviews these reports, e.g. "Head RO" (for an SRO) or "SRO" (for an RO). */
  reviewer?: string;
};

/** Reports the manager submitted to their reviewer, with review status and feedback. */
export function MyReports({ reports, isLoading, error, reviewer = "Head RO" }: MyReportsProps) {
  const labels = myStatusLabels(reviewer);
  const [viewingId, setViewingId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <th className="px-5 py-3">Report Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">{reviewer} feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && <TableMessageRow colSpan={6} message="Loading your reports..." />}
            {!isLoading && error && <TableMessageRow colSpan={6} message={error} error />}

            {!isLoading &&
              !error &&
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => setViewingId(report.id)}
                      className="flex items-center gap-2 text-left text-xs font-semibold text-gray-800 hover:text-brand hover:underline"
                    >
                      <Eye size={14} className="shrink-0 text-gray-400" />
                      {report.title}
                      {!!report.content?.attachments?.length && (
                        <span
                          className="flex items-center gap-0.5 font-normal text-gray-400"
                          title={`${report.content.attachments.length} PDF attachment(s)`}
                        >
                          <Paperclip size={12} />
                          {report.content.attachments.length}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-gray-600">
                    {reportTypeLabels[report.type] || report.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-gray-600">
                    {report.period
                      ? `${formatReportDate(report.period.startDate)} – ${formatReportDate(report.period.endDate)}`
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-gray-600">{formatReportDate(report.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[report.status]}`}>
                      {labels[report.status]}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3.5 text-xs text-gray-500">{report.reviewComment || "—"}</td>
                </tr>
              ))}

            {!isLoading && !error && reports.length === 0 && (
              <TableMessageRow colSpan={6} message={`You haven't submitted any reports yet. Use “Submit Report” to send one to the ${reviewer}.`} />
            )}
          </tbody>
        </table>
      </div>

      <ReportDetailModal reportId={viewingId} onClose={() => setViewingId(null)} />
    </>
  );
}
