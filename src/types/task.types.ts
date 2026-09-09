import { Timestamp } from "firebase/firestore";

export type TaskStatus = 
  | "assigned" 
  | "in-progress" 
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
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}
