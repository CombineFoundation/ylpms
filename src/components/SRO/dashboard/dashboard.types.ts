import type { EventStatus } from "@/types/event.types";

export type ReportStatus = "draft" | "submitted" | "reviewed" | "approved" | "rejected";

/** Activities in the viewer's scope and the workflow items waiting on them. */
export type ActivitySummary = {
  awaitingApproval: number;
  awaitingVerification: number;
  upcoming: number;
  completedThisMonth: number;
  certificatesIssued: number;
  reviewQueue: { id: string; title: string; status: EventStatus; organizerName: string; date: string }[];
  upcomingEvents: { id: string; title: string; date: string; location: string; organizerName: string }[];
};

/** Pending member requests: ones to approve (SRO / RO) or ones you sent (youth leader). */
export type MemberRequestSummary = { kind: "to-approve" | "sent"; pending: number } | null;

export type SRODashboardSummary = {
  stats: {
    assignedROs: number;
    youthLeaders: number;
    volunteers: number;
    pendingReports: number;
    activeTasks: number;
    overdueTasks: number;
  };
  monthlyActivity: { month: string; tasksCompleted: number; reportsSubmitted: number; activitiesCompleted: number }[];
  roPerformance: { id: string; name: string; region?: string; performance: number | null; tasksAssigned: number }[];
  taskOverview: { pending: number; inProgress: number; completed: number; overdue: number };
  upcomingTasks: { id: string; title: string; dueDate: string; assigneeName: string }[];
  recentReports: { id: string; title: string; status: ReportStatus; submittedByName: string; date: string }[];
  notifications: { id: string; title: string; message: string; read: boolean; createdAt: string | null }[];
  unreadNotificationCount: number;
  activities: ActivitySummary;
  memberRequests: MemberRequestSummary;
};

const AVATAR_COLORS = ["bg-red-400", "bg-orange-400", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500"];

/** Stable avatar colour per id, so a person keeps the same colour across widgets. */
export function avatarColor(id: string) {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
