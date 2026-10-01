import type { TaskPriority, TaskStatus } from "@/types/task.types";
import type { ActivitySummary, SRODashboardSummary } from "@/components/SRO/dashboard/dashboard.types";

export type RoleCount = {
  total: number;
  newThisMonth: number;
};

export type DashboardSummary = {
  stats: Record<"sro" | "ro" | "youth-leader" | "volunteer", RoleCount>;
  volunteerGrowth: { month: string; value: number }[];
  volunteersByRegion: { name: string; value: number; color: string }[];
  pendingReportCount: number;
  pendingReports: {
    id: string;
    title: string;
    submittedByName: string;
    submittedByRegion: string;
  }[];
  overdueTaskCount: number;
  upcomingTasks: {
    id: string;
    title: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assigneeName: string;
  }[];
  activities: ActivitySummary;
  notifications: SRODashboardSummary["notifications"];
  unreadNotificationCount: number;
};

export const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-amber-100 text-amber-600",
  high: "bg-red-100 text-red-500",
  urgent: "bg-red-100 text-red-600",
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
