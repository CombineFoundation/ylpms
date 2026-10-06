"use client";

import { Eye } from "lucide-react";
import { LoadMoreButton, TableMessageRow } from "../shared/ListParts";
import { isReviewable, statusLabels, statusStyles, type DisplayReport } from "./report-display.types";

type ReportsTableProps = {
  reports: DisplayReport[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  reviewingId: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onView: (report: DisplayReport) => void;
  onApprove: (report: DisplayReport) => void;
  onReject: (report: DisplayReport) => void;
  /** False for a view-only list (no approve/reject buttons). */
};

export function ReportsTable({
  reports,
  isLoading,
  error,
  emptyMessage,
  reviewingId,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onView,
  onApprove,
  onReject,
}: ReportsTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Report Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Submitted By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Region</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && <TableMessageRow colSpan={6} message="Loading reports..." />}

            {!isLoading && error && <TableMessageRow colSpan={6} message={error} error />}

            {!isLoading &&
              !error &&
              reports.map((report) => (
                <tr key={report.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-5 py-3.5 text-xs font-semibold text-gray-800">
                    <button type="button" onClick={() => onView(report)} className="text-left hover:text-brand hover:underline">
                      {report.title}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-gray-600">{report.submittedBy}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-gray-600">{report.region}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-gray-600">{report.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(report)}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                        title="View report"
                        aria-label={`View "${report.title}"`}
                      >
                        <Eye size={15} />
                      </button>
                      {report.canReview && isReviewable(report.status) && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(report)}
                            disabled={reviewingId === report.id}
                            className="rounded-md bg-brand px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(report)}
                            disabled={reviewingId === report.id}
                            className="rounded-md border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            Ask for changes
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && !error && reports.length === 0 && <TableMessageRow colSpan={6} message={emptyMessage} />}
          </tbody>
        </table>
      </div>
      {!isLoading && !error && (
        <LoadMoreButton hasMore={hasMore} isLoadingMore={isLoadingMore} onClick={onLoadMore} shownCount={reports.length} />
      )}
    </>
  );
}
