import { Timestamp } from "firebase/firestore";
import type { ReportAttachment } from "./report.types";

/**
 * "submitted": the assignee handed in work and the assigner must review it.
 * "changes-requested": the assigner sent it back; the assignee resubmits.
 */
export type TaskStatus =
  | "assigned"
  | "in-progress"
  | "submitted"
  | "changes-requested"
  | "completed"
  | "overdue"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // User ID
  assignedBy: string; // User ID who created the task
  dueDate: Timestamp | Date;
  completedDate?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  attachments?: string[]; // File URLs
  comments?: TaskComment[];
  /** What the assignee handed in when completing the task. */
  submission?: TaskSubmission;
  /** The assigner's latest decision on the submission. */
  review?: TaskReview;
  /** Set on program-month tasks (see src/config/monthly-tasks.ts), e.g. "month-1". */
  monthlyCycle?: string;
  monthlyTemplateId?: string;
  /** The assigner's activity (event) this task is for, and its title at link time. */
  eventId?: string;
  eventTitle?: string;
}

export interface TaskSubmission {
  note: string;
  /** PDFs uploaded via POST /api/reports/attachments. */
  attachments: ReportAttachment[];
  submittedBy: string;
  submittedAt: Timestamp | Date;
}

export type TaskReviewDecision = "accepted" | "changes-requested";

export interface TaskReview {
  decision: TaskReviewDecision;
  /** Feedback for the assignee; required when asking for changes. */
  note?: string;
  reviewedBy: string;
  reviewedAt: Timestamp | Date;
}

export interface TaskComment {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp | Date;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  priority: TaskPriority;
  attachments?: File[];
  /** Links the task to one of the assigner's open activities. */
  eventId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assignedTo?: string;
  /** null removes the activity link. */
  eventId?: string | null;
}

/** Statuses a task can be in while still needing work (from the assignee or its reviewer). */
export const OPEN_TASK_STATUSES: TaskStatus[] = ["assigned", "in-progress", "submitted", "changes-requested", "overdue"];
