import { z } from "zod";
import type { TaskPriority, TaskReviewDecision, TaskStatus } from "@/types/task.types";
import type { ReportAttachment } from "@/types/report.types";
import type { UserRole } from "@/types/user.types";
import type { TimestampInput } from "@/utils/user-status";
import { timestampToDate } from "@/utils/user-status";

/** A task as returned by GET /api/tasks (assignee name resolved server-side). */
export type ApiTask = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assigneeName: string;
  assigneeRole?: UserRole;
  dueDate: TimestampInput;
  priority: TaskPriority;
  status: TaskStatus;
  submission?: ApiTaskSubmission;
  review?: ApiTaskReview;
  /** The activity this task is for, if the assigner linked one. */
  eventId?: string;
  eventTitle?: string;
};

/** What the assignee handed in (timestamps serialized). */
export type ApiTaskSubmission = {
  note: string;
  attachments: ReportAttachment[];
  submittedAt: TimestampInput;
};

/** The assigner's latest decision on the submission (timestamps serialized). */
export type ApiTaskReview = {
  decision: TaskReviewDecision;
  note?: string;
  reviewedAt: TimestampInput;
};

export type TaskRow = {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeRole?: UserRole;
  dueDate: string;
  dueDateInputValue: string;
  priority: TaskPriority;
  status: TaskStatus;
  submission?: ApiTaskSubmission;
  review?: ApiTaskReview;
  eventId?: string;
  eventTitle?: string;
};

export function toTaskRow(task: ApiTask): TaskRow {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    assigneeId: task.assignedTo,
    assigneeName: task.assigneeName,
    assigneeRole: task.assigneeRole,
    dueDate: formatDueDate(task.dueDate),
    dueDateInputValue: toDateInputValue(task.dueDate),
    priority: task.priority,
    status: task.status,
    submission: task.submission,
    review: task.review,
    eventId: task.eventId,
    eventTitle: task.eventTitle,
  };
}

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-amber-100 text-amber-600",
  high: "bg-red-100 text-red-500",
  urgent: "bg-red-100 text-red-600",
};

export const statusLabels: Record<TaskStatus, string> = {
  assigned: "Assigned",
  "in-progress": "In Progress",
  submitted: "In Review",
  "changes-requested": "Changes Requested",
  completed: "Done",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export const statusStyles: Record<TaskStatus, string> = {
  assigned: "bg-amber-100 text-amber-600",
  "in-progress": "bg-blue-100 text-blue-600",
  submitted: "bg-violet-100 text-violet-600",
  "changes-requested": "bg-orange-100 text-orange-600",
  completed: "bg-emerald-100 text-emerald-600",
  overdue: "bg-red-100 text-red-500",
  cancelled: "bg-gray-100 text-gray-400",
};

export const TASK_STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "submitted", label: "In Review" },
  { value: "changes-requested", label: "Changes Requested" },
  { value: "overdue", label: "Overdue" },
  { value: "assigned", label: "Assigned" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export type TaskStatusFilter = (typeof TASK_STATUS_FILTERS)[number]["value"];

export function formatDueDate(value?: TimestampInput): string {
  const date = timestampToDate(value);
  return date ? date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "-";
}

/** YYYY-MM-DD in the user's local timezone (not UTC, which can shift the day). */
export function toDateInputValue(value?: TimestampInput | Date): string {
  const date = value instanceof Date ? value : timestampToDate(value);
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A date input's value → ISO timestamp for the END of that local day, so "due today" is valid. */
export function endOfLocalDayIso(dateInputValue: string): string {
  const [year, month, day] = dateInputValue.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

export const ASSIGNEE_ROLES: { value: UserRole; label: string }[] = [
  { value: "sro", label: "SRO" },
  { value: "ro", label: "RO" },
  { value: "youth-leader", label: "Youth Leader" },
  { value: "volunteer", label: "Volunteer" },
];

export const taskFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  assigneeRole: z.enum(["sro", "ro", "youth-leader", "volunteer"]),
  assignedTo: z.string().min(1, "Choose who this task is for"),
  dueDate: z
    .string()
    .min(1, "Choose a due date")
    .refine((value) => value >= toDateInputValue(new Date()), "Due date can't be in the past"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

/** Editing may keep an existing past due date (e.g. to change priority on an overdue task). */
export const editTaskFormSchema = taskFormSchema.extend({
  dueDate: z.string().min(1, "Choose a due date"),
});

export type TaskForm = z.infer<typeof taskFormSchema>;
