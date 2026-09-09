import { Timestamp } from "firebase/firestore";

export type NotificationType = 
  | "task-assigned" 
  | "task-completed" 
  | "report-submitted" 
  | "user-added" 
  | "event-created" 
  | "course-enrolled" 
  | "assignment-graded" 
  | "system-alert"
  | "other";

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string; // ID of related entity (task, report, etc.)
  relatedType?: "task" | "report" | "user" | "event" | "course" | "assignment";
  read: boolean;
  actionUrl?: string;
  createdAt: Timestamp | Date;
  readAt?: Timestamp | Date;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: "task" | "report" | "user" | "event" | "course" | "assignment";
  actionUrl?: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: Record<NotificationType, boolean>;
  updatedAt: Timestamp | Date;
}
