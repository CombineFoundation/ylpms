import { Timestamp } from "firebase/firestore";

export type ReportType = "monthly" | "quarterly" | "annual" | "task-completion" | "volunteer-hours" | "custom";

export type ReportStatus = "draft" | "submitted" | "reviewed" | "approved";

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  submittedBy: string; // User ID
  reviewedBy?: string; // User ID
  period: {
    startDate: Timestamp | Date;
    endDate: Timestamp | Date;
  };
  content: {
    summary: string;
    achievements: string[];
    challenges: string[];
    metrics: Record<string, number>;
    attachments?: string[];
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
  };
}

export interface UpdateReportRequest {
  title?: string;
  content?: Partial<Report["content"]>;
  status?: ReportStatus;
}
