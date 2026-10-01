import { getDocsByIds, queryDocs } from "@/utils/firestore";
import { toDate } from "@/utils/aggregation";
import { getEffectiveStatus, type DisplayStatus } from "@/utils/user-status";
import { logger } from "@/utils/errors";
import { getPerformanceTree, type PerformanceNode, type PerformanceTree } from "./performance.service";
import { withEffectiveStatus } from "./task.service";
import { enrichReportsForList } from "./report.service";
import type { Task } from "@/types/task.types";
import type { Report } from "@/types/report.types";
import type { User, UserRole } from "@/types/user.types";
import { OPEN_ACTIVITY_STATUSES, type Event } from "@/types/event.types";

/**
 * Team Service - data for a manager's own team (everyone below them in the
 * reporting tree). Shared by the SRO and RO portals.
 */

/** Firestore `in` accepts at most 30 values per query. */
const IN_LIMIT = 30;

export type Team = {
  tree: PerformanceTree;
  /** Everyone below the manager (all levels). */
  members: PerformanceNode[];
  memberIds: Set<string>;
};

/** The manager's whole reporting tree, resolved from the shared performance tree. */
export async function getTeam(managerId: string): Promise<Team> {
  const tree = await getPerformanceTree();
  const memberIds = new Set<string>();
  const collect = (id: string) =>
    tree.nodes[id]?.childIds.forEach((childId) => {
      memberIds.add(childId);
      collect(childId);
    });
  collect(managerId);
  return { tree, members: [...memberIds].map((id) => tree.nodes[id]), memberIds };
}

export function chunk<T>(items: T[], size = IN_LIMIT): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

// ---------------------------------------------------------------------------
// Tasks

export type TeamTask = Task & { assigneeName: string; assigneeRole?: UserRole; assignerName: string };

export interface TeamTasks {
  assignedToMe: TeamTask[];
  assignedByMe: TeamTask[];
  /** Team members the manager can assign work to. */
  assignees: { id: string; name: string; role: UserRole }[];
  /** A youth leader's open activities, which their tasks can be linked to. */
  openActivities: { id: string; title: string; startDate: Event["startDate"] }[];
}

/** Activities the organizer runs that are approved and haven't ended yet, soonest first. */
async function getOpenActivities(organizerId: string): Promise<TeamTasks["openActivities"]> {
  const now = new Date();
  const events = await queryDocs<Event>("events", [{ field: "organizerIds", operator: "array-contains", value: organizerId }]);
  return events
    .filter((event) => OPEN_ACTIVITY_STATUSES.includes(event.status) && (toDate(event.endDate) ?? now) >= now)
    .sort((a, b) => (toDate(a.startDate)?.getTime() ?? 0) - (toDate(b.startDate)?.getTime() ?? 0))
    .map((event) => ({ id: event.id, title: event.title, startDate: event.startDate }));
}

const byDueDate = (a: Task, b: Task) =>
  (toDate(a.dueDate)?.getTime() ?? Infinity) - (toDate(b.dueDate)?.getTime() ?? Infinity);

/**
 * Tasks for a manager's Tasks page. Equality-only queries (sorted in memory)
 * so no extra composite index is needed for `assignedBy`.
 */
export async function getTeamTasks(managerId: string): Promise<TeamTasks> {
  try {
    const [team, assignedToMe, assignedByMe] = await Promise.all([
      getTeam(managerId),
      queryDocs<Task>("tasks", [{ field: "assignedTo", operator: "==", value: managerId }]),
      queryDocs<Task>("tasks", [{ field: "assignedBy", operator: "==", value: managerId }]),
    ]);

    const all = [...assignedToMe, ...assignedByMe];
    const personIds = [...new Set(all.flatMap((task) => [task.assignedTo, task.assignedBy]).filter(Boolean))];
    const people = await getDocsByIds<User>("users", personIds);
    const personById = new Map(people.map((person) => [person.id, person]));

    const enrich = (task: Task): TeamTask => ({
      ...withEffectiveStatus(task),
      assigneeName: personById.get(task.assignedTo)?.name || "Unknown user",
      assigneeRole: personById.get(task.assignedTo)?.role,
      assignerName: personById.get(task.assignedBy)?.name || "Unknown user",
    });

    const roleOrder: UserRole[] = ["ro", "youth-leader", "volunteer"];
    return {
      assignedToMe: assignedToMe.filter((task) => task.status !== "cancelled").sort(byDueDate).map(enrich),
      // A task assigned to yourself shows once, under "Assigned to me".
      assignedByMe: assignedByMe
        .filter((task) => task.assignedTo !== managerId && task.status !== "cancelled")
        .sort(byDueDate)
        .map(enrich),
      assignees: team.members
        .map((member) => ({ id: member.id, name: member.name, role: member.role }))
        .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role) || a.name.localeCompare(b.name)),
      // Only youth leaders link their volunteers' tasks to activities.
      openActivities: team.tree.nodes[managerId]?.role === "youth-leader" ? await getOpenActivities(managerId) : [],
    };
  } catch (error) {
    logger.error(`Error fetching team tasks for ${managerId}`, error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Reports

/** Every non-draft report submitted by someone in the manager's team, newest first. */
export async function getTeamReports(managerId: string) {
  try {
    const { memberIds } = await getTeam(managerId);
    if (memberIds.size === 0) return [];

    const reports = (
      await Promise.all(
        chunk([...memberIds]).map((ids) => queryDocs<Report>("reports", [{ field: "submittedBy", operator: "in", value: ids }]))
      )
    )
      .flat()
      .filter((report) => report.status !== "draft");

    const reportDate = (report: Report) => toDate(report.submittedAt)?.getTime() ?? toDate(report.createdAt)?.getTime() ?? 0;
    reports.sort((a, b) => reportDate(b) - reportDate(a));

    return enrichReportsForList(reports);
  } catch (error) {
    logger.error(`Error fetching team reports for ${managerId}`, error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Volunteers

export interface TeamVolunteer {
  id: string;
  name: string;
  email?: string;
  memberId?: string;
  region?: string;
  /** Their direct manager (a youth leader, or the RO themselves). */
  managerId: string | null;
  managerName: string;
  managerRole?: UserRole;
  openTasks: number;
  completedTasks: number;
  performance: number | null;
  status: DisplayStatus;
}

/** Every volunteer anywhere under the manager, with who they report to. */
export async function getTeamVolunteers(managerId: string): Promise<TeamVolunteer[]> {
  try {
    const { tree, members } = await getTeam(managerId);
    const volunteers = members.filter((node) => node.role === "volunteer");
    if (volunteers.length === 0) return [];

    const users = await getDocsByIds<User>("users", volunteers.map((node) => node.id));
    const userById = new Map(users.map((user) => [user.id, user]));

    return volunteers
      .map((node) => {
        const user = userById.get(node.id);
        const manager = node.parentId ? tree.nodes[node.parentId] : undefined;
        return {
          id: node.id,
          name: node.name,
          email: user?.email,
          memberId: user?.memberId,
          region: node.region,
          managerId: manager?.id ?? null,
          managerName: manager?.name ?? "Unassigned",
          managerRole: manager?.role,
          openTasks: node.ownTasks.assigned - node.ownTasks.completed,
          completedTasks: node.ownTasks.completed,
          performance: node.performance,
          status: user ? getEffectiveStatus(user) : ("Pending" as DisplayStatus),
        };
      })
      .sort((a, b) => a.managerName.localeCompare(b.managerName) || a.name.localeCompare(b.name));
  } catch (error) {
    logger.error(`Error fetching volunteers for ${managerId}`, error);
    throw error;
  }
}
