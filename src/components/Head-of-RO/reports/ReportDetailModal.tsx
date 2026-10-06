"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { MemberProfileCard, nameWithRole } from "@/components/shared/MemberProfileCard";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { ReportAttachments } from "./ReportAttachments";
import {
  formatReportDate,
  isReviewable,
  reportTypeLabels,
  statusLabels,
  statusStyles,
  type ApiReport,
} from "./report-display.types";

type ReportDetailModalProps = {
  reportId: string | null;
  onClose: () => void;
  /** Omit for a read-only view (e.g. the submitter looking at their own report). */
  onReview?: (report: { id: string; title: string }, decision: "approved" | "rejected") => void;
};

/** Full report content, so the reviewer can read it before approving or rejecting. */
export function ReportDetailModal({ reportId, onClose, onReview }: ReportDetailModalProps) {
  const [report, setReport] = useState<ApiReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    setReport(null);
    setError(null);
    apiFetch<ApiReport>(`/api/reports/${reportId}`)
      .then((data) => !cancelled && setReport(data))
      .catch((err) => !cancelled && setError(errorMessage(err, "Unable to load this report.")));
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  const metrics = Object.entries(report?.content?.metrics || {});

  return (
    <Modal isOpen={!!reportId} title={report?.title || "Report"} onClose={onClose} size="xl">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!error && !report && <p className="text-sm text-gray-400">Loading report...</p>}
      {report && (
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className={`rounded-full px-2.5 py-1 font-semibold ${statusStyles[report.status]}`}>
              {statusLabels[report.status]}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1">{reportTypeLabels[report.type] || report.type}</span>
            <span>
              By <span className="font-medium text-gray-700">{nameWithRole(report.submittedByName ?? "Unknown", report.submittedByRole)}</span> ·{" "}
              {report.submittedByRegion}
            </span>
            <span>· Submitted {formatReportDate(report.createdAt)}</span>
            {report.period && (
              <span>
                · Period {formatReportDate(report.period.startDate)} – {formatReportDate(report.period.endDate)}
              </span>
            )}
          </div>

          {onReview && report.submitterProfile && <MemberProfileCard title="Submitted by" profile={report.submitterProfile} />}

          <section>
            <h3 className="mb-1 font-semibold text-gray-800">Summary</h3>
            <p className="whitespace-pre-line text-gray-600">{report.content?.summary || "—"}</p>
          </section>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <section>
              <h3 className="mb-1 font-semibold text-gray-800">Achievements</h3>
              <ul className="list-disc space-y-1 pl-5 text-gray-600">
                {(report.content?.achievements || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="mb-1 font-semibold text-gray-800">Challenges</h3>
              <ul className="list-disc space-y-1 pl-5 text-gray-600">
                {(report.content?.challenges || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          {metrics.length > 0 && (
            <section>
              <h3 className="mb-2 font-semibold text-gray-800">Metrics</h3>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {metrics.map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-gray-50 p-3">
                    <dt className="text-xs text-gray-400">{key}</dt>
                    <dd className="text-lg font-bold text-gray-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <ReportAttachments reportId={report.id} attachments={report.content?.attachments ?? []} />

          {report.reviewComment && (
            <section className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <h3 className="mb-1 text-xs font-semibold text-gray-500">Reviewer comment</h3>
              <p className="text-gray-700">{report.reviewComment}</p>
            </section>
          )}

          {report.previousReviewComment && !report.reviewComment && (
            <section className="rounded-lg border border-amber-100 bg-amber-50 p-3">
              <h3 className="mb-1 text-xs font-semibold text-amber-700">Resubmitted after this feedback</h3>
              <p className="whitespace-pre-line text-gray-700">{report.previousReviewComment}</p>
            </section>
          )}

          {onReview && isReviewable(report.status) && (
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => onReview?.(report, "rejected")}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onReview?.(report, "approved")}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Approve
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
