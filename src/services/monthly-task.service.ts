import { batchWrite, getDocsByIds, queryDocs } from "@/utils/firestore";
import { AuthorizationError, ConflictError, logger } from "@/utils/errors";
import { getEffectiveStatus } from "@/utils/user-status";
import { currentCycle, endOfPktDay, type MonthlyCycle } from "@/utils/monthly-cycle";
import { MONTHLY_TASKS, type MonthlyTaskRole, type MonthlyTaskTemplate } from "@/config/monthly-tasks";
import { createActivityLog } from "./activitylog.service";
import { notifyUsers } from "./notification.service";
import { TASKS_ROUTE_BY_ROLE } from "./task.service";
import { getTeam } from "./team.service";
import { asCycleCohort, getCurrentCohort } from "./cohort.service";
import { FIRST_SYSTEM_COHORT } from "@/config/cohorts";
import { formatDate } from "@/utils/format-date";
import type { Task } from "@/types/task.types";
import type { User, UserRole } from "@/types/user.types";

/**
 * Monthly Tasks - each program month (15th → 15th) has a fixed task list per
 * role. Head RO assigns it to everyone; an SRO or RO to their own team. Task
 * ids are deterministic (month + template + user), so whoever clicks first
 * assigns it and later clicks only fill in people added since. Each task is
 * recorded as assigned by the youth leader's RO, who alone reviews it.
 */

type Caller = { userId: string; role: UserRole };

/** Monthly tasks only go to youth leaders; these roles can assign them (to all / their team's). */
const ROLES_BELOW: Partial<Record<UserRole, MonthlyTaskRole[]>> = {
  developer: ["youth-leader"],
  "head-ro": ["youth-leader"],
  sro: ["youth-leader"],
  ro: ["youth-leader"],
};

const roleNames: Record<MonthlyTaskRole, string> = { "youth-leader": "youth leaders" };

const taskId = (cycle: MonthlyCycle, templateId: string, userId: string) => `${cycle.key}_${templateId}_${userId}`;

/** Only people who can sign in and have done so (active or idle) get monthly tasks. */
const isEligible = (user: User) => {
  const status = getEffectiveStatus(user);
  return status === "Active" || status === "Idle";
};

export type MonthlyTaskStatus = {
  cycle: { number: number; label: string; rangeLabel: string; dueLabel: string } | null;
  /** The task lists for this month, by role, limited to roles the caller can assign to. */
  templates: { role: MonthlyTaskRole; roleName: string; tasks: { title: string }[] }[];
  /** Active/idle people in the caller's scope who should get this month's tasks. */
  recipients: number;
  /** Of those, how many are still missing at least one task. */
  pending: number;
  state: "ready" | "assigned" | "not-started" | "no-tasks" | "no-recipients";
};

type Plan = {
  cycle: MonthlyCycle;
  templatesByRole: [MonthlyTaskRole, MonthlyTaskTemplate[]][];
  recipients: User[];
  missing: { user: User; template: MonthlyTaskTemplate }[];
};

async function planMonthlyTasks(caller: Caller): Promise<{ cycle: MonthlyCycle | null; plan: Plan | null; roles: MonthlyTaskRole[] }> {
  const roles = ROLES_BELOW[caller.role];
  if (!roles) throw new AuthorizationError("Only Head RO, SRO and RO accounts can assign monthly tasks");

  const cohort = await getCurrentCohort();
  const cycle = currentCycle(new Date(), asCycleCohort(cohort));
  if (!cycle) return { cycle, plan: null, roles };

  const lists = MONTHLY_TASKS[cycle.number] ?? {};
  const templatesByRole = roles
    .map((role) => [role, lists[role] ?? []] as [MonthlyTaskRole, MonthlyTaskTemplate[]])
    .filter(([, templates]) => templates.length > 0);
  if (templatesByRole.length === 0) return { cycle, plan: { cycle, templatesByRole, recipients: [], missing: [] }, roles };

  const targetRoles = templatesByRole.map(([role]) => role);
  let candidates: User[];
  if (caller.role === "head-ro" || caller.role === "developer") {
    candidates = await queryDocs<User>("users", [{ field: "role", operator: "in", value: targetRoles }]);
  } else {
    const { members } = await getTeam(caller.userId);
    const ids = members.filter((member) => targetRoles.includes(member.role as MonthlyTaskRole)).map((member) => member.id);
    candidates = await getDocsByIds<User>("users", ids);
  }
  // Only the current cohort's youth leaders (older accounts belong to YLP 2.0).
  const recipients = candidates.filter((user) => isEligible(user) && (user.cohortId || FIRST_SYSTEM_COHORT.id) === cohort.id);

  const existing = new Set(
    (await queryDocs<Task>("tasks", [{ field: "monthlyCycle", operator: "==", value: cycle.key }])).map((task) => task.id)
  );
  const templatesFor = new Map(templatesByRole);
  const missing = recipients.flatMap((user) =>
    (templatesFor.get(user.role as MonthlyTaskRole) ?? [])
      .filter((template) => !existing.has(taskId(cycle, template.id, user.id)))
      .map((template) => ({ user, template }))
  );

  return { cycle, plan: { cycle, templatesByRole, recipients, missing }, roles };
}

const dueLabel = (cycle: MonthlyCycle) => formatDate(cycle.end);

/** What "Assign Monthly Task" would do for this caller right now. */
export async function getMonthlyTaskStatus(caller: Caller): Promise<MonthlyTaskStatus> {
  const { cycle, plan } = await planMonthlyTasks(caller);
  if (!cycle || !plan) return { cycle: null, templates: [], recipients: 0, pending: 0, state: "not-started" };

  const pendingUsers = new Set(plan.missing.map(({ user }) => user.id));
  const state: MonthlyTaskStatus["state"] =
    plan.templatesByRole.length === 0
      ? "no-tasks"
      : plan.recipients.length === 0
        ? "no-recipients"
        : pendingUsers.size === 0
          ? "assigned"
          : "ready";

  return {
    cycle: { number: cycle.number, label: cycle.label, rangeLabel: cycle.rangeLabel, dueLabel: dueLabel(cycle) },
    templates: plan.templatesByRole.map(([role, templates]) => ({
      role,
      roleName: roleNames[role],
      tasks: templates.map((template) => ({ title: template.title })),
    })),
    recipients: plan.recipients.length,
    pending: pendingUsers.size,
    state,
  };
}

/**
 * Assigns this month's tasks to everyone in the caller's scope who doesn't
 * have them yet. `caller` is who they're assigned as (a developer acting in a
 * portal assigns as that SRO/RO); `actorUserId` is who actually clicked.
 */
export async function assignMonthlyTasks(caller: Caller, actorUserId = caller.userId) {
  try {
    const { cycle, plan } = await planMonthlyTasks(caller);
    if (!cycle || !plan) throw new ConflictError("The program hasn't started yet — Month 1 begins on Sep 15, 2026.");
    if (plan.templatesByRole.length === 0) throw new ConflictError(`No tasks have been set for ${cycle.label} yet.`);
    if (plan.missing.length === 0) throw new ConflictError(`${cycle.label} tasks are already assigned to everyone.`);

    await batchWrite(
      plan.missing.map(({ user, template }) => ({
        type: "set" as const,
        collection: "tasks",
        docId: taskId(cycle, template.id, user.id),
        data: {
          title: template.title,
          description: template.description,
          status: "assigned",
          priority: template.priority ?? "medium",
          assignedTo: user.id,
          // The youth leader's own RO owns (sees and reviews) the task, whoever clicked;
          // Head RO and SROs only view their team's monthly tasks.
          assignedBy: ("reportingToId" in user && user.reportingToId) || caller.userId,
          dueDate: template.dueDate ? endOfPktDay(template.dueDate) : cycle.end,
          monthlyCycle: cycle.key,
          monthlyTemplateId: template.id,
        } satisfies Omit<Task, "id" | "createdAt" | "updatedAt">,
      }))
    );

    // One notification per person, linking to their own portal's Tasks page.
    const countByUser = new Map<string, { user: User; count: number }>();
    plan.missing.forEach(({ user }) =>
      countByUser.set(user.id, { user, count: (countByUser.get(user.id)?.count ?? 0) + 1 })
    );
    await Promise.all(
      [...countByUser.values()].map(({ user, count }) =>
        notifyUsers([user.id], {
          type: "task-assigned",
          title: `${cycle.label} tasks assigned`,
          message: `${count} task${count === 1 ? "" : "s"} for ${cycle.rangeLabel} · due ${dueLabel(cycle)}`,
          relatedType: "task",
          actionUrl: TASKS_ROUTE_BY_ROLE[user.role],
        })
      )
    ).catch((error) => logger.error(`Failed to notify recipients of ${cycle.key} tasks`, error));

    await createActivityLog({
      userId: actorUserId,
      action: "task-created",
      description: `Assigned ${plan.missing.length} ${cycle.label} task(s) to ${countByUser.size} user(s)${
        actorUserId !== caller.userId ? ` on behalf of ${caller.userId}` : ""
      }`,
      entityType: "task",
      entityId: cycle.key,
    });

    logger.info(`${cycle.key}: ${plan.missing.length} tasks assigned by ${caller.userId}`);
    return { cycle: cycle.label, tasksCreated: plan.missing.length, usersAssigned: countByUser.size };
  } catch (error) {
    logger.error("Error assigning monthly tasks", error);
    throw error;
  }
}
