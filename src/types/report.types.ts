import { Timestamp } from "firebase/firestore";

export type ReportType = "monthly" | "quarterly" | "annual" | "task-completion" | "volunteer-hours" | "custom";

export type ReportStatus = "draft" | "submitted" | "reviewed" | "approved" | "rejected";

/** A PDF stored in Firebase Storage; downloaded via GET /api/reports/[reportId]/attachments/[index]. */
export interface ReportAttachment {
  /** Storage object path, always under `reports/{submitterId}/`. */
  path: string;
  /** Original file name, for display and download. */
  name: string;
  /** Bytes. */
  size: number;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  submittedBy: string; // User ID
  reviewedBy?: string; // User ID
  reviewComment?: string; // Reviewer's feedback, e.g. why it was rejected
  /** The feedback a returned report was resubmitted after, so the reviewer can check it was addressed. */
  previousReviewComment?: string;
  period: {
    startDate: Timestamp | Date;
    endDate: Timestamp | Date;
  };
  content: {
    summary: string;
    achievements: string[];
    challenges: string[];
    metrics: Record<string, number>;
    attachments?: ReportAttachment[];
  };
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  submittedAt?: Timestamp | Date;
  reviewedAt?: Timestamp | Date;
}

export interface CreateReportRequest {
  title: string;
  type: ReportType;
  period: {
    startDate: Date;
    endDate: Date;
  };
  content: {
    summary: string;
    achievements: string[];
    challenges: string[];
    metrics: Record<string, number>;
    attachments?: ReportAttachment[];
  };
}

export interface UpdateReportRequest {
  title?: string;
  content?: Partial<Report["content"]>;
  status?: ReportStatus;
}
