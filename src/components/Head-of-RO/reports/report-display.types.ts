import type { ReportAttachment, ReportStatus, ReportType } from "@/types/report.types";
import type { MemberProfile, UserRole } from "@/types/user.types";
import { formatDate } from "@/utils/format-date";
import { timestampToDate, type TimestampInput } from "@/utils/user-status";

export type ApiReport = {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  submittedBy: string;
  submittedByName?: string;
  submittedByRegion?: string;
  submittedByRole?: UserRole;
  /** GET /api/reports/[reportId] only: the submitter's details and reporting chain. */
  submitterProfile?: MemberProfile;
  createdAt?: TimestampInput;
  reviewedAt?: TimestampInput;
  reviewComment?: string;
  /** Set when a returned report was resubmitted: the feedback it was changed after. */
  previousReviewComment?: string;
  period?: { startDate: TimestampInput; endDate: TimestampInput };
  content?: {
    summary: string;
    achievements: string[];
    challenges: string[];
    metrics: Record<string, number>;
    attachments?: ReportAttachment[];
  };
};

export type DisplayReport = {
  id: string;
  title: string;
  submittedBy: string;
  region: string;
  date: string;
  status: ReportStatus;
};

export function toDisplayReport(report: ApiReport): DisplayReport {
  return {
    id: report.id,
    title: report.title,
    submittedBy: report.submittedByName || "Unknown",
    region: report.submittedByRegion || "Unassigned",
    date: formatReportDate(report.createdAt),
    status: report.status,
  };
}

export const statusLabels: Record<ReportStatus, string> = {
  draft: "Draft",
  submitted: "Pending",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
};

export const statusStyles: Record<ReportStatus, string> = {
  draft: "bg-gray-100 text-gray-500",
  submitted: "bg-orange-100 text-brand",
  reviewed: "bg-blue-100 text-blue-600",
  approved: "bg-green-100 text-green-600",
  rejected: "bg-red-100 text-red-500",
};

export const reportTypeLabels: Record<ReportType, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  "task-completion": "Task completion",
  "volunteer-hours": "Volunteer hours",
  custom: "Custom",
};

export const REPORT_STATUS_FILTERS = [
  { value: "submitted", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
] as const;

export type ReportStatusFilter = (typeof REPORT_STATUS_FILTERS)[number]["value"];

/** Reports awaiting a decision (the reviewer can approve/reject these). */
export function isReviewable(status: ReportStatus) {
  return status === "submitted" || status === "reviewed";
}

export function formatReportDate(value?: TimestampInput): string {
  return formatDate(timestampToDate(value));
}
