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
  | "event-created" 
  | "course-enrolled" 
  | "other";

export interface ActivityLog {
  id: string;
  userId: string; // Who performed the action
  action: ActivityAction;
  description: string;
  entityType: "user" | "task" | "report" | "event" | "course" | "volunteer" | "other";
  entityId: string; // ID of the entity being acted upon
  changes?: Record<string, { oldValue: any; newValue: any }>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp | Date;
}

export interface CreateActivityLogRequest {
  userId: string;
  action: ActivityAction;
  description: string;
  entityType: "user" | "task" | "report" | "event" | "course" | "volunteer" | "other";
  entityId: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  ipAddress?: string;
}
