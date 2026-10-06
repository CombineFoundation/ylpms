import type { UserRole } from "@/types/user.types";
import type { TaskStatus } from "@/types/task.types";
import type { ActivityStatus } from "@/types/activity.types";
import { selectFields, selectFieldsWithIds, writeCount } from "@/utils/firestore";
import { toDate } from "@/utils/aggregation";
import { logger } from "@/utils/errors";

/**
 * Overall (all-time) performance for every user in the reporting tree:
 *
 *   performance = 60% activity score + 40% task score
 *
 * - Task score: completed ÷ assigned tasks across the user's team (the user
 *   plus everyone below them; a volunteer's team is just themselves).
 *   Cancelled tasks don't count.
 * - Activity score: of the approved activities (activities) the team organized
 *   that have ended, the share that were verified (completed). Cancelled ones,
 *   and ones still ahead or awaiting approval, don't count. For a volunteer:
 *   activities they took part in ÷ ended activities they signed up for.
 * - When only one score exists it's used alone; with neither, performance is
 *   null (shown as "—"), not 0.
 *
 * Product decision: the site shows the score but never explains how it's
 * calculated, so keep the formula out of UI copy.
 */
const ACTIVITY_WEIGHT = 0.6;
const TASK_WEIGHT = 0.4;

const TRACKED_ROLES: UserRole[] = ["sro", "ro", "youth-leader", "volunteer"];
const ASSIGNED_FIELDS = ["assignedROIds", "assignedYouthLeaderIds", "assignedVolunteerIds"] as const;
/** Approved and past the review step: these count once the activity has ended. */
const APPROVED_STATUSES: ActivityStatus[] = ["planned", "ongoing", "evidence-submitted"];

export interface TaskCounts {
  assigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export interface ActivityCounts {
  /** Ended approved activities (or, for a volunteer, ones they signed up for / took part in). */
  counted: number;
  /** Of those, verified (for a volunteer: verified with them as a participant). */
  completed: number;
}

export interface PerformanceNode {
  id: string;
  name: string;
  role: UserRole;
  region?: string;
  parentId: string | null;
  /** Direct reports, in the same order the UI lists them. */
  childIds: string[];
  /** Tasks assigned to this user only. */
  ownTasks: TaskCounts;
  /** Tasks across the user and everyone below them. */
  teamTasks: TaskCounts;
  /** Activities this user organized (a volunteer: took part in). */
  ownActivities: ActivityCounts;
  /** Activities organized across the user's team (a volunteer: their own). */
  teamActivities: ActivityCounts;
  /** Users below this one (all levels). */
  teamSize: number;
  /** 0–100, or null when there's nothing to score yet. */
  performance: number | null;
}

export interface PerformanceTree {
  /** Top-level ids (SROs), best performers first. */
  rootIds: string[];
  nodes: Record<string, PerformanceNode>;
  /** ROs / youth leaders / volunteers not reachable from any SRO. */
  unassignedCount: number;
}

type UserRow = {
  name?: string;
  email?: string;
  role?: UserRole;
  region?: string;
  reportingToId?: string;
} & Partial<Record<(typeof ASSIGNED_FIELDS)[number], string[]>>;

type TaskRow = { assignedTo?: string; status?: TaskStatus; dueDate?: unknown };

type ActivityRow = {
  status?: ActivityStatus;
  endDate?: unknown;
  organizerIds?: string[];
  attendees?: string[];
  evidence?: { participantIds?: string[] };
};

const emptyCounts = (): TaskCounts => ({ assigned: 0, completed: 0, inProgress: 0, overdue: 0 });
const emptyActivities = (): ActivityCounts => ({ counted: 0, completed: 0 });

function addCounts(target: TaskCounts, source: TaskCounts) {
  target.assigned += source.assigned;
  target.completed += source.completed;
  target.inProgress += source.inProgress;
  target.overdue += source.overdue;
}

function addActivities(target: ActivityCounts, source: ActivityCounts) {
  target.counted += source.counted;
  target.completed += source.completed;
}

function countTasks(tasks: TaskRow[], now: Date): Map<string, TaskCounts> {
  const byUser = new Map<string, TaskCounts>();
  tasks.forEach((task) => {
    if (!task.assignedTo || task.status === "cancelled") return;
    const counts = byUser.get(task.assignedTo) ?? emptyCounts();
    counts.assigned += 1;
    if (task.status === "completed") {
      counts.completed += 1;
    } else if (task.status === "submitted") {
      // Work handed in for review isn't late, whatever the due date.
      counts.inProgress += 1;
    } else {
      const due = toDate(task.dueDate);
      if (task.status === "overdue" || (due && due < now)) counts.overdue += 1;
      else if (task.status === "in-progress" || task.status === "changes-requested") counts.inProgress += 1;
    }
    byUser.set(task.assignedTo, counts);
  });
  return byUser;
}

/**
 * Per-user activity counts: `organized` for organizers, `attended` for
 * volunteers (signed up, or credited as a participant by the organizer).
 */
function countActivities(activities: ActivityRow[], now: Date) {
  const organized = new Map<string, ActivityCounts>();
  const attended = new Map<string, ActivityCounts>();
  const bump = (map: Map<string, ActivityCounts>, userId: string, completed: boolean) => {
    const counts = map.get(userId) ?? emptyActivities();
    counts.counted += 1;
    if (completed) counts.completed += 1;
    map.set(userId, counts);
  };

  activities.forEach((activity) => {
    const isCompleted = activity.status === "completed";
    const hasEnded = (toDate(activity.endDate) ?? now) < now;
    // Still ahead, awaiting approval, rejected or cancelled: nothing to score yet.
    if (!isCompleted && !(activity.status && APPROVED_STATUSES.includes(activity.status) && hasEnded)) return;

    (activity.organizerIds ?? []).forEach((id) => bump(organized, id, isCompleted));
    const participants = new Set(isCompleted ? activity.evidence?.participantIds ?? [] : []);
    new Set([...(activity.attendees ?? []), ...participants]).forEach((id) => bump(attended, id, participants.has(id)));
  });

  return { organized, attended };
}

const rate = (done: number, total: number) => (total > 0 ? done / total : null);

function scoreFor(node: PerformanceNode): number | null {
  const taskScore = rate(node.teamTasks.completed, node.teamTasks.assigned);
  const activityScore = rate(node.teamActivities.completed, node.teamActivities.counted);
  if (taskScore === null && activityScore === null) return null;
  if (taskScore === null) return Math.round(activityScore! * 100);
  if (activityScore === null) return Math.round(taskScore * 100);
  return Math.round((ACTIVITY_WEIGHT * activityScore + TASK_WEIGHT * taskScore) * 100);
}

/**
 * The tree reads every user, task and activity, and nearly every team view
 * needs it (often more than once per request), so it's shared for a short
 * while. It's rebuilt sooner when this instance writes to any of its source
 * collections; writes from other instances show up within CACHE_MS.
 */
const CACHE_MS = 30 * 1000;
const SOURCE_COLLECTIONS = ["users", "tasks", "events"];
let cached: { tree: Promise<PerformanceTree>; at: number; version: string } | null = null;

const sourceVersion = () => SOURCE_COLLECTIONS.map(writeCount).join(":");

export function getPerformanceTree(): Promise<PerformanceTree> {
  const version = sourceVersion();
  if (cached && cached.version === version && Date.now() - cached.at < CACHE_MS) return cached.tree;
  const tree = buildPerformanceTree();
  cached = { tree, at: Date.now(), version };
  // A failed build mustn't be served to later callers.
  tree.catch(() => {
    if (cached?.tree === tree) cached = null;
  });
  return tree;
}

async function buildPerformanceTree(): Promise<PerformanceTree> {
  try {
    const userFields = ["name", "email", "role", "region", "reportingToId", ...ASSIGNED_FIELDS];
    const [users, tasks, activities] = await Promise.all([
      selectFieldsWithIds<UserRow>("users", [{ field: "role", operator: "in", value: TRACKED_ROLES }], userFields),
      selectFields<TaskRow>("tasks", [], ["assignedTo", "status", "dueDate"]),
      selectFields<ActivityRow>("events", [], ["status", "endDate", "organizerIds", "attendees", "evidence.participantIds"]),
    ]);

    const now = new Date();
    const byId = new Map(users.map((user) => [user.id, user]));
    const taskCounts = countTasks(tasks, now);
    const { organized, attended } = countActivities(activities, now);

    // Parent = reportingToId; fall back to a manager that lists the user in an
    // assigned-* array, in case only one side of the assignment was written.
    const listedBy = new Map<string, string>();
    users.forEach((manager) =>
      ASSIGNED_FIELDS.forEach((field) => manager[field]?.forEach((childId) => listedBy.set(childId, manager.id)))
    );
    const parentOf = (user: UserRow & { id: string }): string | null => {
      const candidate = user.reportingToId || listedBy.get(user.id);
      return candidate && candidate !== user.id && byId.has(candidate) ? candidate : null;
    };

    const nodes: Record<string, PerformanceNode> = {};
    users.forEach((user) => {
      const activityMap = user.role === "volunteer" ? attended : organized;
      nodes[user.id] = {
        id: user.id,
        name: user.name || user.email || "Unnamed user",
        role: user.role!,
        region: user.region,
        parentId: user.role === "sro" ? null : parentOf(user),
        childIds: [],
        ownTasks: taskCounts.get(user.id) ?? emptyCounts(),
        teamTasks: emptyCounts(),
        ownActivities: { ...(activityMap.get(user.id) ?? emptyActivities()) },
        teamActivities: emptyActivities(),
        teamSize: 0,
        performance: null,
      };
    });
    Object.values(nodes).forEach((node) => {
      if (node.parentId) nodes[node.parentId].childIds.push(node.id);
    });

    // Post-order roll-up. `visiting` guards against bad data forming a cycle.
    const visiting = new Set<string>();
    const rollUp = (id: string): number => {
      const node = nodes[id];
      visiting.add(id);
      addCounts(node.teamTasks, node.ownTasks);
      addActivities(node.teamActivities, node.ownActivities);
      let members = 1;
      node.childIds = node.childIds.filter((childId) => !visiting.has(childId));
      node.childIds.forEach((childId) => {
        members += rollUp(childId);
        const child = nodes[childId];
        addCounts(node.teamTasks, child.teamTasks);
        // A team's activities are the ones its members organized; volunteers' sign-ups only score the volunteer.
        if (child.role !== "volunteer") addActivities(node.teamActivities, child.teamActivities);
      });
      node.teamSize = members - 1;
      node.performance = scoreFor(node);
      node.childIds.sort(byPerformance(nodes));
      visiting.delete(id);
      return members;
    };

    const rootIds = Object.values(nodes)
      .filter((node) => node.role === "sro")
      .map((node) => node.id);
    rootIds.forEach(rollUp);
    rootIds.sort(byPerformance(nodes));
    // People not (yet) under an SRO still get scores for their own team views.
    Object.values(nodes)
      .filter((node) => node.role !== "sro" && node.parentId === null)
      .forEach((node) => rollUp(node.id));

    const reachable = new Set<string>();
    const mark = (id: string) => {
      reachable.add(id);
      nodes[id].childIds.forEach(mark);
    };
    rootIds.forEach(mark);

    return { rootIds, nodes, unassignedCount: users.length - reachable.size };
  } catch (error) {
    logger.error("Error building performance tree", error);
    throw error;
  }
}

/** Highest performance first; unscored users go last, then by name. */
function byPerformance(nodes: Record<string, PerformanceNode>) {
  return (a: string, b: string) => {
    const left = nodes[a].performance ?? -1;
    const right = nodes[b].performance ?? -1;
    return right - left || nodes[a].name.localeCompare(nodes[b].name);
  };
}
