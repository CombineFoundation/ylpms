import { getDocById, getDocCount, getDocsByIds, queryDocs, selectFields, selectFieldsWithIds } from "@/utils/firestore";
import { getRequestsByRequester, getRequestsForApprover } from "./member-request.service";
import { getReports, enrichReportsForList } from "./report.service";
import { getTasks, enrichTasksForList, withEffectiveStatus } from "./task.service";
import { getTeam } from "./team.service";
import { getNotificationsForUser, getUnreadNotificationCount } from "./notification.service";
import { countActivitiesByStatus } from "./activity.service";
import { getCertificatesForUser } from "./certificate.service";
import { timestampToDate, type TimestampInput } from "@/utils/user-status";
import { buildRegionBreakdown, lastNMonths, startOfMonth, toDate } from "@/utils/aggregation";
import { logger } from "@/utils/errors";
import type { User, UserRole } from "@/types/user.types";
import type { Task, TaskPriority, TaskStatus } from "@/types/task.types";
import type { ReportStatus } from "@/types/report.types";
import type { Activity, ActivityStatus } from "@/types/activity.types";
import { formatDate } from "@/utils/format-date";

const GROWTH_MONTHS = 7;
const PENDING_REPORTS_SHOWN = 5;
/** Submitted reports scanned for the ones awaiting Head RO (SROs' reports). */
const PENDING_REVIEW_SCAN = 500;
const UPCOMING_TASKS_SHOWN = 5;

export interface RoleCount {
  total: number;
  newThisMonth: number;
}

export interface HeadRODashboardSummary {
  stats: Record<Extract<UserRole, "sro" | "ro" | "youth-leader" | "volunteer">, RoleCount>;
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
}

async function countRole(role: UserRole): Promise<RoleCount> {
  const [total, newThisMonth] = await Promise.all([
    getDocCount("users", [{ field: "role", operator: "==", value: role }]),
    getDocCount("users", [
      { field: "role", operator: "==", value: role },
      { field: "createdAt", operator: ">=", value: startOfMonth() },
    ]),
  ]);

  return { total, newThisMonth };
}

/** Running volunteer total at the end of each month, via count() aggregates. */
async function volunteerGrowth(): Promise<{ month: string; value: number }[]> {
  const months = lastNMonths(GROWTH_MONTHS);
  const counts = await Promise.all(
    months.map(({ monthEnd }) =>
      getDocCount("users", [
        { field: "role", operator: "==", value: "volunteer" },
        { field: "createdAt", operator: "<=", value: monthEnd },
      ])
    )
  );
  return months.map(({ label }, index) => ({ month: label, value: counts[index] }));
}

export interface SRODashboardSummary {
  stats: {
    assignedROs: number;
    youthLeaders: number;
    volunteers: number;
    pendingReports: number;
    activeTasks: number;
    overdueTasks: number;
  };
  /** Tasks completed, reports submitted and activities completed by the team, per month. */
  monthlyActivity: { month: string; tasksCompleted: number; reportsSubmitted: number; activitiesCompleted: number }[];
  roPerformance: { id: string; name: string; region?: string; performance: number | null; tasksAssigned: number }[];
  taskOverview: { pending: number; inProgress: number; completed: number; overdue: number };
  upcomingTasks: { id: string; title: string; dueDate: string; assigneeName: string }[];
  recentReports: { id: string; title: string; status: ReportStatus; submittedByName: string; date: string }[];
  notifications: { id: string; title: string; message: string; read: boolean; createdAt: string | null }[];
  unreadNotificationCount: number;
  activities: ActivitySummary;
  memberRequests: MemberRequestSummary | null;
}

type TaskRow = { title?: string; assignedTo?: string; status?: TaskStatus; dueDate?: unknown; completedDate?: unknown };
type ReportRow = { title?: string; status?: ReportStatus; submittedBy?: string; createdAt?: unknown; submittedAt?: unknown };
type ActivityRow = {
  title?: string;
  status?: ActivityStatus;
  startDate?: unknown;
  endDate?: unknown;
  location?: string;
  organizerIds?: string[];
  organizerRole?: UserRole;
  certificateCount?: number;
  certificatesIssuedAt?: unknown;
};
const ACTIVITY_FIELDS = [
  "title",
  "status",
  "startDate",
  "endDate",
  "location",
  "organizerIds",
  "organizerRole",
  "certificateCount",
  "certificatesIssuedAt",
];

const RECENT_REPORTS_SHOWN = 4;
const SRO_UPCOMING_TASKS_SHOWN = 3;
const NOTIFICATIONS_SHOWN = 4;
const ACTIVITY_ITEMS_SHOWN = 4;

const shortDate = (date: Date | null) => formatDate(date);

/** Activities a manager is responsible for, and the workflow items waiting on them. */
export interface ActivitySummary {
  /** Youth leaders' proposals waiting on the viewer's approval. */
  awaitingApproval: number;
  /** Evidence waiting on the viewer's verification. */
  awaitingVerification: number;
  /** Approved or in progress, not yet ended. */
  upcoming: number;
  completedThisMonth: number;
  certificatesIssued: number;
  reviewQueue: { id: string; title: string; status: ActivityStatus; organizerName: string; date: string }[];
  upcomingActivities: { id: string; title: string; date: string; location: string; organizerName: string }[];
}

const REVIEW_STATUSES: ActivityStatus[] = ["submitted", "evidence-submitted"];

/**
 * Summarizes `activities` (already narrowed to the viewer's scope). `canReview`
 * says whether an activity's organizer is someone the viewer reviews.
 */
async function summarizeActivities(
  activities: (ActivityRow & { id: string })[],
  canReview: (organizerId: string) => boolean,
  knownNames: (id: string) => string | undefined = () => undefined
): Promise<ActivitySummary> {
  const now = new Date();
  const monthStart = startOfMonth();
  const organizerOf = (activity: ActivityRow) => activity.organizerIds?.[0] ?? "";

  const queue = activities
    .filter(
      (activity) =>
        REVIEW_STATUSES.includes(activity.status!) && activity.organizerRole === "youth-leader" && canReview(organizerOf(activity))
    )
    .sort((a, b) => (toDate(a.startDate)?.getTime() ?? 0) - (toDate(b.startDate)?.getTime() ?? 0));
  const upcoming = activities
    .filter((activity) => (activity.status === "planned" || activity.status === "ongoing") && (toDate(activity.endDate) ?? now) >= now)
    .sort((a, b) => (toDate(a.startDate)?.getTime() ?? 0) - (toDate(b.startDate)?.getTime() ?? 0));

  // Resolve only the names actually shown.
  const shown = [...queue.slice(0, ACTIVITY_ITEMS_SHOWN), ...upcoming.slice(0, ACTIVITY_ITEMS_SHOWN)];
  const missing = [...new Set(shown.map(organizerOf).filter((id) => id && !knownNames(id)))];
  const fetched = new Map((await getDocsByIds<User>("users", missing)).map((user) => [user.id, user.name]));
  const nameOf = (id: string) => knownNames(id) ?? fetched.get(id) ?? "Unknown organizer";

  return {
    awaitingApproval: queue.filter((activity) => activity.status === "submitted").length,
    awaitingVerification: queue.filter((activity) => activity.status === "evidence-submitted").length,
    upcoming: upcoming.length,
    completedThisMonth: activities.filter(
      (activity) => activity.status === "completed" && (toDate(activity.certificatesIssuedAt) ?? new Date(0)) >= monthStart
    ).length,
    certificatesIssued: activities.reduce((sum, activity) => sum + (activity.certificateCount ?? 0), 0),
    reviewQueue: queue.slice(0, ACTIVITY_ITEMS_SHOWN).map((activity) => ({
      id: activity.id,
      title: activity.title || "Untitled activity",
      status: activity.status!,
      organizerName: nameOf(organizerOf(activity)),
      date: shortDate(toDate(activity.startDate)),
    })),
    upcomingActivities: upcoming.slice(0, ACTIVITY_ITEMS_SHOWN).map((activity) => ({
      id: activity.id,
      title: activity.title || "Untitled activity",
      date: shortDate(toDate(activity.startDate)),
      location: activity.location || "",
      organizerName: nameOf(organizerOf(activity)),
    })),
  };
}

/** Member requests on a dashboard: ones to approve (SRO / RO) or ones you sent (youth leader). */
export interface MemberRequestSummary {
  kind: "to-approve" | "sent";
  pending: number;
}

async function memberRequestSummary(userId: string, role: UserRole): Promise<MemberRequestSummary | null> {
  const pending = (requests: { status: string }[]) => requests.filter((request) => request.status === "pending").length;
  if (role === "sro") return { kind: "to-approve", pending: pending(await getRequestsForApprover("youth-leader", userId)) };
  if (role === "ro") return { kind: "to-approve", pending: pending(await getRequestsForApprover("volunteer", userId)) };
  if (role === "youth-leader") return { kind: "sent", pending: pending(await getRequestsByRequester("volunteer", userId)) };
  return null;
}

/** A manager's team dashboard; leads are their direct-report role (ROs for an SRO, youth leaders for an RO). */
export interface TeamDashboardSummary {
  stats: {
    leads: number;
    youthLeaders: number;
    volunteers: number;
    pendingReports: number;
    activeTasks: number;
    overdueTasks: number;
  };
  monthlyActivity: SRODashboardSummary["monthlyActivity"];
  leadPerformance: SRODashboardSummary["roPerformance"];
  taskOverview: SRODashboardSummary["taskOverview"];
  upcomingTasks: SRODashboardSummary["upcomingTasks"];
  recentReports: SRODashboardSummary["recentReports"];
  notifications: SRODashboardSummary["notifications"];
  unreadNotificationCount: number;
  activities: ActivitySummary;
  memberRequests: MemberRequestSummary | null;
}

export type RODashboardSummary = TeamDashboardSummary;

/**
 * Dashboard for a manager's team (everyone below them). Their own tasks and
 * activities count towards the stats; reports only count when submitted by
 * someone in the team — except for a youth leader, whose volunteers don't
 * submit reports, so their own are shown instead.
 */
async function getTeamDashboardSummary(sroId: string, leadRole: UserRole): Promise<TeamDashboardSummary> {
  try {
    const [
      { tree, members: team, memberIds: teamIds },
      tasks,
      reports,
      activities,
      notificationPage,
      unreadNotificationCount,
      manager,
    ] = await Promise.all([
      getTeam(sroId),
      selectFieldsWithIds<TaskRow>("tasks", [], ["title", "assignedTo", "status", "dueDate", "completedDate"]),
      selectFieldsWithIds<ReportRow>("reports", [], ["title", "status", "submittedBy", "createdAt", "submittedAt"]),
      selectFieldsWithIds<ActivityRow>("events", [], ACTIVITY_FIELDS),
      getNotificationsForUser(sroId, { pageSize: NOTIFICATIONS_SHOWN, pageNumber: 1 }),
      getUnreadNotificationCount(sroId),
      getDocById<User>("users", sroId),
    ]);

    const taskOwners = new Set([...teamIds, sroId]);
    const reportOwners = leadRole === "volunteer" ? new Set([sroId]) : teamIds;
    const teamActivities = activities.filter((activity) => taskOwners.has(activity.organizerIds?.[0] ?? ""));

    const now = new Date();
    const taskOverview = { pending: 0, inProgress: 0, completed: 0, overdue: 0 };
    const teamTasks = tasks.filter((task) => task.assignedTo && taskOwners.has(task.assignedTo) && task.status !== "cancelled");
    teamTasks.forEach((task) => {
      const due = toDate(task.dueDate);
      if (task.status === "completed") taskOverview.completed += 1;
      // Work handed in for review isn't late, whatever the due date.
      else if (task.status === "submitted") taskOverview.inProgress += 1;
      else if (task.status === "overdue" || (due && due < now)) taskOverview.overdue += 1;
      else if (task.status === "in-progress" || task.status === "changes-requested") taskOverview.inProgress += 1;
      else taskOverview.pending += 1;
    });

    const teamReports = reports.filter(
      (report) => report.submittedBy && reportOwners.has(report.submittedBy) && report.status !== "draft"
    );
    const reportDate = (report: ReportRow) => toDate(report.submittedAt) ?? toDate(report.createdAt);

    const nameOf = (id?: string) => (id && tree.nodes[id]?.name) || "Unknown user";

    const upcomingTasks = teamTasks
      .map((task) => ({ task, due: toDate(task.dueDate) }))
      .filter(({ task, due }) => task.status !== "completed" && task.status !== "overdue" && due && due >= now)
      .sort((a, b) => a.due!.getTime() - b.due!.getTime())
      .slice(0, SRO_UPCOMING_TASKS_SHOWN)
      .map(({ task, due }) => ({
        id: task.id,
        title: task.title || "Untitled task",
        dueDate: shortDate(due),
        assigneeName: nameOf(task.assignedTo),
      }));

    const recentReports = teamReports
      .map((report) => ({ report, date: reportDate(report) }))
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .slice(0, RECENT_REPORTS_SHOWN)
      .map(({ report, date }) => ({
        id: report.id,
        title: report.title || "Untitled report",
        status: report.status!,
        submittedByName: nameOf(report.submittedBy),
        date: shortDate(date),
      }));

    const monthlyActivity = lastNMonths(GROWTH_MONTHS).map(({ label, monthStart, monthEnd }) => {
      const inMonth = (date: Date | null) => date !== null && date >= monthStart && date <= monthEnd;
      return {
        month: label,
        tasksCompleted: teamTasks.filter((task) => task.status === "completed" && inMonth(toDate(task.completedDate))).length,
        reportsSubmitted: teamReports.filter((report) => inMonth(reportDate(report))).length,
        activitiesCompleted: teamActivities.filter(
          (activity) => activity.status === "completed" && inMonth(toDate(activity.certificatesIssuedAt))
        ).length,
      };
    });

    const [activitySummary, memberRequests] = await Promise.all([
      // Only ROs and SROs review; a youth leader's own activities are in their pipeline instead.
      summarizeActivities(
        teamActivities,
        (organizerId) => leadRole !== "volunteer" && teamIds.has(organizerId),
        (id) => tree.nodes[id]?.name ?? (id === sroId ? manager?.name : undefined)
      ),
      memberRequestSummary(sroId, manager?.role ?? leadRole),
    ]);

    const ros = team.filter((node) => node.role === leadRole);
    const roPerformance = ros
      .map((node) => ({
        id: node.id,
        name: node.name,
        region: node.region,
        performance: node.performance,
        tasksAssigned: node.teamTasks.assigned,
      }))
      .sort((a, b) => (b.performance ?? -1) - (a.performance ?? -1) || a.name.localeCompare(b.name));

    return {
      stats: {
        leads: ros.length,
        youthLeaders: team.filter((node) => node.role === "youth-leader").length,
        volunteers: team.filter((node) => node.role === "volunteer").length,
        // Reports this manager reviews: their direct reports' (a youth leader: their own, awaiting their RO).
        pendingReports: teamReports.filter(
          (report) =>
            report.status === "submitted" &&
            (leadRole === "volunteer" || tree.nodes[report.submittedBy ?? ""]?.parentId === sroId)
        ).length,
        activeTasks: taskOverview.pending + taskOverview.inProgress + taskOverview.overdue,
        overdueTasks: taskOverview.overdue,
      },
      monthlyActivity,
      leadPerformance: roPerformance,
      taskOverview,
      upcomingTasks,
      recentReports,
      notifications: notificationPage.items.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: toDate(notification.createdAt)?.toISOString() ?? null,
      })),
      unreadNotificationCount,
      activities: activitySummary,
      memberRequests,
    };
  } catch (error) {
    logger.error(`Error building team dashboard summary for ${sroId}`, error);
    throw error;
  }
}

/** The SRO's dashboard: their ROs, those ROs' youth leaders and volunteers. */
export async function getSRODashboardSummary(sroId: string): Promise<SRODashboardSummary> {
  const { stats, leadPerformance, ...rest } = await getTeamDashboardSummary(sroId, "ro");
  const { leads, ...otherStats } = stats;
  return { ...rest, stats: { assignedROs: leads, ...otherStats }, roPerformance: leadPerformance };
}

/** The RO's dashboard: their youth leaders and the volunteers under them. */
export async function getRODashboardSummary(roId: string): Promise<RODashboardSummary> {
  return getTeamDashboardSummary(roId, "youth-leader");
}

/** Where each of a youth leader's activities is in the workflow. */
export interface ActivityPipeline {
  drafts: number;
  awaitingApproval: number;
  upcoming: number;
  awaitingVerification: number;
  completed: number;
  needsChanges: number;
}

export type YouthLeaderDashboardSummary = TeamDashboardSummary & {
  pipeline: ActivityPipeline;
  certificates: number;
};

/** The youth leader's dashboard: their volunteers (as `leads`), tasks, reports and activities. */
export async function getYouthLeaderDashboardSummary(youthLeaderId: string): Promise<YouthLeaderDashboardSummary> {
  const [team, byStatus, certificates] = await Promise.all([
    getTeamDashboardSummary(youthLeaderId, "volunteer"),
    countActivitiesByStatus(youthLeaderId),
    getCertificatesForUser(youthLeaderId),
  ]);
  return {
    ...team,
    pipeline: {
      drafts: byStatus.draft ?? 0,
      awaitingApproval: byStatus.submitted ?? 0,
      upcoming: (byStatus.planned ?? 0) + (byStatus.ongoing ?? 0),
      awaitingVerification: byStatus["evidence-submitted"] ?? 0,
      completed: byStatus.completed ?? 0,
      needsChanges: byStatus.rejected ?? 0,
    },
    certificates: certificates.length,
  };
}

export interface VolunteerDashboardSummary {
  stats: {
    openTasks: number;
    overdueTasks: number;
    completedTasks: number;
    /** Share of assigned tasks completed, or null before any are assigned. */
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
}

const VOLUNTEER_LIST_SHOWN = 4;

/** A volunteer's own dashboard: their tasks, the activities they signed up for, and certificates. */
export async function getVolunteerDashboardSummary(volunteerId: string): Promise<VolunteerDashboardSummary> {
  try {
    const [volunteer, tasks, activities, certificates, notificationPage, unreadNotificationCount] = await Promise.all([
      getDocById<User>("users", volunteerId),
      queryDocs<Task>("tasks", [{ field: "assignedTo", operator: "==", value: volunteerId }]),
      queryDocs<Activity>("events", [{ field: "attendees", operator: "array-contains", value: volunteerId }]),
      getCertificatesForUser(volunteerId),
      getNotificationsForUser(volunteerId, { pageSize: NOTIFICATIONS_SHOWN, pageNumber: 1 }),
      getUnreadNotificationCount(volunteerId),
    ]);

    const managerId = volunteer && "reportingToId" in volunteer ? volunteer.reportingToId : "";
    const manager = managerId ? await getDocById<User>("users", managerId) : null;

    const now = new Date();
    const liveTasks = tasks.filter((task) => task.status !== "cancelled").map(withEffectiveStatus);
    const completedTasks = liveTasks.filter((task) => task.status === "completed").length;
    const openTasks = liveTasks.filter((task) => task.status !== "completed");

    const upcomingActivities = activities
      .filter((activity) => (activity.status === "planned" || activity.status === "ongoing") && (toDate(activity.endDate) ?? now) >= now)
      .sort((a, b) => (toDate(a.startDate)?.getTime() ?? 0) - (toDate(b.startDate)?.getTime() ?? 0));
    const attended = certificates.filter((certificate) => certificate.kind === "participation").length;

    return {
      stats: {
        openTasks: openTasks.length,
        overdueTasks: openTasks.filter((task) => task.status === "overdue").length,
        completedTasks,
        completionRate: liveTasks.length > 0 ? Math.round((completedTasks / liveTasks.length) * 100) : null,
        upcomingActivities: upcomingActivities.length,
        activitiesAttended: attended,
        certificates: certificates.length,
      },
      manager: manager ? { name: manager.name, role: manager.role } : null,
      upcomingTasks: openTasks
        .sort((a, b) => (toDate(a.dueDate)?.getTime() ?? Infinity) - (toDate(b.dueDate)?.getTime() ?? Infinity))
        .slice(0, VOLUNTEER_LIST_SHOWN)
        .map((task) => ({
          id: task.id,
          title: task.title,
          dueDate: shortDate(toDate(task.dueDate)),
          priority: task.priority,
          status: task.status,
        })),
      upcomingActivities: upcomingActivities.slice(0, VOLUNTEER_LIST_SHOWN).map((activity) => ({
        id: activity.id,
        title: activity.title,
        date: shortDate(toDate(activity.startDate)),
        location: activity.location,
        status: activity.status,
      })),
      recentCertificates: certificates.slice(0, VOLUNTEER_LIST_SHOWN).map((certificate) => ({
        id: certificate.id,
        title: certificate.title,
        eventTitle: certificate.eventTitle,
        issuedAt: shortDate(toDate(certificate.issuedAt)),
      })),
      notifications: notificationPage.items.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: toDate(notification.createdAt)?.toISOString() ?? null,
      })),
      unreadNotificationCount,
    };
  } catch (error) {
    logger.error(`Error building volunteer dashboard summary for ${volunteerId}`, error);
    throw error;
  }
}

/**
 * Aggregates the org-wide dashboard summary for Head RO / developer.
 */
export async function getHeadRODashboardSummary(viewerId: string): Promise<HeadRODashboardSummary> {
  try {
    const now = new Date();
    const [
      sro,
      ro,
      youthLeader,
      volunteer,
      growth,
      volunteerRegions,
      pendingReportsPage,
      upcomingTasksPage,
      overdueTaskCount,
      activities,
      notificationPage,
      unreadNotificationCount,
    ] = await Promise.all([
      countRole("sro"),
      countRole("ro"),
      countRole("youth-leader"),
      countRole("volunteer"),
      volunteerGrowth(),
      // Only the region field — not whole volunteer documents.
      selectFields<{ region?: string }>("users", [{ field: "role", operator: "==", value: "volunteer" }], ["region"]),
      getReports({ status: "submitted", pageSize: PENDING_REVIEW_SCAN, pageNumber: 1 }),
      // Still-open tasks that aren't past due yet, soonest first.
      getTasks({ status: "open", dueAfter: now, pageSize: UPCOMING_TASKS_SHOWN, pageNumber: 1 }),
      getDocCount("tasks", [
        { field: "status", operator: "in", value: ["assigned", "in-progress", "overdue"] },
        { field: "dueDate", operator: "<", value: now },
      ]),
      selectFieldsWithIds<ActivityRow>("events", [], ACTIVITY_FIELDS),
      getNotificationsForUser(viewerId, { pageSize: NOTIFICATIONS_SHOWN, pageNumber: 1 }),
      getUnreadNotificationCount(viewerId),
    ]);

    const [submittedReports, upcomingTasks, activitySummary] = await Promise.all([
      enrichReportsForList(pendingReportsPage.items),
      enrichTasksForList(upcomingTasksPage.items),
      // Head RO can review every youth leader's activity.
      summarizeActivities(activities, () => true),
    ]);

    // Head RO reviews SROs' reports (and anyone's without a manager); the rest go to their own manager.
    const awaitingHeadRo = submittedReports.filter(
      (report) => !report.submittedByManagerId || report.submittedByRole === "sro"
    );
    const pendingReportCount = awaitingHeadRo.length;
    const pendingReports = awaitingHeadRo.slice(0, PENDING_REPORTS_SHOWN);

    return {
      stats: { sro, ro, "youth-leader": youthLeader, volunteer },
      volunteerGrowth: growth,
      volunteersByRegion: buildRegionBreakdown(volunteerRegions),
      pendingReportCount,
      pendingReports: pendingReports.map((report) => ({
        id: report.id,
        title: report.title,
        submittedByName: report.submittedByName,
        submittedByRegion: report.submittedByRegion,
      })),
      overdueTaskCount,
      upcomingTasks: upcomingTasks.map((task) => {
        const dueDate = timestampToDate(task.dueDate as TimestampInput);
        return {
          id: task.id,
          title: task.title,
          dueDate: formatDate(dueDate),
          priority: task.priority,
          status: task.status,
          assigneeName: task.assigneeName,
        };
      }),
      activities: activitySummary,
      notifications: notificationPage.items.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: toDate(notification.createdAt)?.toISOString() ?? null,
      })),
      unreadNotificationCount,
    };
  } catch (error) {
    logger.error("Error building Head RO dashboard summary", error);
    throw error;
  }
}
