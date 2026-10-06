import type { SRODashboardSummary } from "@/components/SRO/dashboard/dashboard.types";
import type { ActivityStatus } from "@/types/activity.types";
import type { TaskPriority, TaskStatus } from "@/types/task.types";
import type { UserRole } from "@/types/user.types";

/** GET /api/dashboard/volunteer */
export type VolunteerDashboardSummary = {
  stats: {
    openTasks: number;
    overdueTasks: number;
    completedTasks: number;
    completionRate: number | null;
    upcomingActivities: number;
    activitiesAttended: number;
    certificates: number;
  };
  manager: { name: string; role: UserRole } | null;
  upcomingTasks: { id: string; title: string; dueDate: string; priority: TaskPriority; status: TaskStatus }[];
  upcomingActivities: { id: string; title: string; date: string; location: string; status: ActivityStatus }[];
  recentCertificates: { id: string; title: string; eventTitle: string; issuedAt: string }[];
  notifications: SRODashboardSummary["notifications"];
  unreadNotificationCount: number;
};
