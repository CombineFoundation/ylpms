import { Timestamp } from "firebase/firestore";

export type ActivityAction = 
  | "user-created" 
  | "user-updated" 
  | "user-deleted" 
  | "login" 
  | "task-created" 
  | "task-updated" 
  | "task-completed" 
  | "report-submitted"
  | "report-reviewed"
  | "event-created"
  | "event-updated"
  | "certificate-issued"
  | "course-enrolled"
  | "other";

export interface ActivityLog {
  id: string;
  userId: string; // Who performed the action
  action: ActivityAction;
  description: string;
  entityType: "user" | "task" | "report" | "event" | "course" | "volunteer" | "cohort" | "other";
  entityId: string; // ID of the entity being acted upon
  changes?: Record<string, { oldValue: unknown; newValue: unknown }>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp | Date;
}

export interface CreateActivityLogRequest {
  userId: string;
  action: ActivityAction;
  description: string;
  entityType: "user" | "task" | "report" | "event" | "course" | "volunteer" | "cohort" | "other";
  entityId: string;
  changes?: Record<string, { oldValue: unknown; newValue: unknown }>;
  ipAddress?: string;
}
