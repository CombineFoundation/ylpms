import {
  createDoc,
  updateDoc,
  deleteDocFromFirestore,
  queryPage,
  getDocById,
  getDocsByIds,
  type Filter,
  type Page,
} from "@/utils/firestore";
import {
  Task,
  TaskStatus,
  TaskSubmission,
  TaskReview,
  CreateTaskRequest,
  UpdateTaskRequest,
  OPEN_TASK_STATUSES,
} from "@/types/task.types";
import type { ReportAttachment } from "@/types/report.types";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError, logger } from "@/utils/errors";
import { requireOwnAttachments } from "./report-attachment.service";
import { timestampToDate, type TimestampInput } from "@/utils/user-status";
import { createActivityLog } from "./activitylog.service";
import { createNotification, isNotificationEnabled } from "./notification.service";
import type { User, UserRole } from "@/types/user.types";
import type { Event } from "@/types/event.types";
import { OPEN_ACTIVITY_STATUSES } from "@/types/event.types";
import { toDate } from "@/utils/aggregation";

/**
 * Task Service - Handles all task-related operations
 */

export const TASKS_ROUTE_BY_ROLE: Record<UserRole, string> = {
  developer: "/Head-of-RO/tasks",
  "head-ro": "/Head-of-RO/tasks",
  sro: "/SRO/tasks",
  ro: "/RO/tasks",
  "youth-leader": "/youth-leader/tasks",
  volunteer: "/volunteer/tasks",
};

/** Statuses that still need work (stored values; "overdue" is derived on read). */
const WORKING_STATUSES: TaskStatus[] = ["assigned", "in-progress"];

export type TaskListItem = Task & { assigneeName: string; assigneeRole?: UserRole };

/**
 * Nothing flips a task's stored status when its due date passes, so derive
 * "overdue" at read time: any still-open task whose due date is in the past.
 */
export function withEffectiveStatus<T extends Task>(task: T): T {
  if (!WORKING_STATUSES.includes(task.status)) return task;
  const due = timestampToDate(task.dueDate as TimestampInput);
  return due && due.getTime() < Date.now() ? { ...task, status: "overdue" } : task;
}

/** An assignee must exist and not be deactivated/suspended. */
async function requireAssignableUser(userId: string): Promise<User> {
  const assignee = await getDocById<User>("users", userId);
  if (!assignee) throw new ValidationError("The selected assignee no longer exists");
  if (assignee.status === "inactive" || assignee.status === "suspended") {
    throw new ValidationError(`${assignee.name} is ${assignee.status} and can't be assigned tasks`);
  }
  return assignee;
}

async function notifyAssignee(task: { id: string; title: string; dueDate: Date }, assignee: User, assignerId: string) {
  if (assignee.id === assignerId) return;
  try {
    const assigner = await getDocById<User>("users", assignerId);
    await createNotification({
      userId: assignee.id,
      type: "task-assigned",
      title: `${assigner?.name || "Someone"} assigned you a task`,
      message: `${task.title} · due ${task.dueDate.toLocaleDateString()}`,
      relatedId: task.id,
      relatedType: "task",
      actionUrl: TASKS_ROUTE_BY_ROLE[assignee.role],
    });
  } catch (error) {
    logger.error(`Failed to notify ${assignee.id} of task ${task.id}`, error);
  }
}

/**
 * `assignedByUserId` is who the task is assigned *as* (shown as the assigner);
 * `actorUserId` is who actually did it, for the audit log — they differ when a
 * developer acts on behalf of an SRO.
 */
/**
 * A task can point at one of its assigner's open activities (approved and not
 * yet ended), e.g. a youth leader's prep work for volunteers. Returns the link
 * to store on the task.
 */
async function resolveLinkedActivity(eventId: string, assignerId: string): Promise<{ eventId: string; eventTitle: string }> {
  const event = await getDocById<Event>("events", eventId);
  if (!event) throw new NotFoundError("Activity not found");
  if (!(event.organizerIds ?? []).includes(assignerId)) {
    throw new AuthorizationError("You can only link a task to an activity you organize");
  }
  const end = toDate(event.endDate);
  if (!OPEN_ACTIVITY_STATUSES.includes(event.status) || (end && end <= new Date())) {
    throw new ValidationError(`"${event.title}" isn't open any more, so tasks can't be linked to it`);
  }
  return { eventId, eventTitle: event.title };
}

export async function createTask(
  data: CreateTaskRequest,
  assignedByUserId: string,
  actorUserId: string = assignedByUserId
): Promise<Task> {
  try {
    const assignee = await requireAssignableUser(data.assignedTo);
    const activity = data.eventId ? await resolveLinkedActivity(data.eventId, assignedByUserId) : undefined;
    const taskId = crypto.randomUUID();

    const taskData: Omit<Task, "id"> = {
      title: data.title,
      description: data.description,
      status: "assigned",
      priority: data.priority,
      assignedTo: data.assignedTo,
      assignedBy: assignedByUserId,
      dueDate: data.dueDate,
      ...activity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const task = await createDoc<Task>("tasks", taskId, taskData as Task);

    await createActivityLog({
      userId: actorUserId,
      action: "task-created",
      description: `Assigned task "${data.title}" to ${assignee.name}${
        actorUserId !== assignedByUserId ? ` on behalf of ${assignedByUserId}` : ""
      }`,
      entityType: "task",
      entityId: taskId,
    });

    await notifyAssignee({ id: taskId, title: data.title, dueDate: data.dueDate }, assignee, assignedByUserId);

    logger.info(`Task created: ${taskId} by ${assignedByUserId}`);
    return task;
  } catch (error) {
    logger.error("Error creating task", error);
    throw error;
  }
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  try {
    const task = await getDocById<Task>("tasks", taskId);
    return task ? withEffectiveStatus(task) : null;
  } catch (error) {
    logger.error(`Error fetching task ${taskId}`, error);
    throw error;
  }
}

/**
 * One page of tasks ordered by due date. `status: "overdue"` matches open
 * tasks past their due date; `status: "open"` matches every task still needing work.
 */
export async function getTasks(filters: {
  status?: TaskStatus | "open";
  assignedTo?: string;
  assignedBy?: string;
  dueAfter?: Date;
  pageSize: number;
  pageNumber: number;
}): Promise<Page<Task>> {
  try {
    const queryFilters: Filter[] = [];
    const now = new Date();

    if (filters.status === "overdue") {
      queryFilters.push({ field: "status", operator: "in", value: WORKING_STATUSES });
      queryFilters.push({ field: "dueDate", operator: "<", value: now });
    } else if (filters.status === "open") {
      queryFilters.push({ field: "status", operator: "in", value: OPEN_TASK_STATUSES });
    } else if (filters.status === "assigned" || filters.status === "in-progress") {
      // Past-due tasks show as overdue, so exclude them from the working statuses.
      queryFilters.push({ field: "status", operator: "==", value: filters.status });
      queryFilters.push({ field: "dueDate", operator: ">=", value: now });
    } else if (filters.status) {
      queryFilters.push({ field: "status", operator: "==", value: filters.status });
    }
    if (filters.dueAfter) {
      queryFilters.push({ field: "dueDate", operator: ">=", value: filters.dueAfter });
    }
    if (filters.assignedTo) {
      queryFilters.push({ field: "assignedTo", operator: "==", value: filters.assignedTo });
    }
    if (filters.assignedBy) {
      queryFilters.push({ field: "assignedBy", operator: "==", value: filters.assignedBy });
    }

    const page = await queryPage<Task>(
      "tasks",
      queryFilters,
      { field: "dueDate", direction: "asc" },
      { pageSize: filters.pageSize, pageNumber: filters.pageNumber }
    );
    return { ...page, items: page.items.map(withEffectiveStatus) };
  } catch (error) {
    logger.error("Error fetching tasks", error);
    throw error;
  }
}

/** Resolves assignee names server-side so the list doesn't need every user. */
export async function enrichTasksForList(tasks: Task[]): Promise<TaskListItem[]> {
  const assigneeIds = [...new Set(tasks.map((task) => task.assignedTo))];
  const assignees = await getDocsByIds<User>("users", assigneeIds);
  const byId = new Map(assignees.map((user) => [user.id, user]));
  return tasks.map((task) => ({
    ...task,
    assigneeName: byId.get(task.assignedTo)?.name || "Unknown user",
    assigneeRole: byId.get(task.assignedTo)?.role,
  }));
}

export async function updateTask(
  taskId: string,
  data: UpdateTaskRequest,
  updatedByUserId: string
): Promise<Task> {
  try {
    const task = await getDocById<Task>("tasks", taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    // "overdue" is derived, never stored — keep the working status instead.
    const update: UpdateTaskRequest & { completedDate?: Date | null; eventTitle?: string | null } = { ...data };
    if (update.status === "overdue") update.status = "assigned";

    // Activity link: null clears it; a new id must be one of the assigner's open activities.
    if (update.eventId === null) {
      if (task.eventId) update.eventTitle = null;
      else delete update.eventId;
    } else if (update.eventId === undefined || update.eventId === task.eventId) {
      delete update.eventId;
    } else {
      Object.assign(update, await resolveLinkedActivity(update.eventId, task.assignedBy));
    }

    const reassignedTo =
      update.assignedTo && update.assignedTo !== task.assignedTo
        ? await requireAssignableUser(update.assignedTo)
        : null;
    if (!reassignedTo) delete update.assignedTo;

    if (update.status === "completed") update.completedDate = new Date();
    else if (update.status && task.status === "completed") update.completedDate = null;

    await updateDoc<Task>("tasks", taskId, update as unknown as Partial<Task>);

    const changes: Record<string, { oldValue: unknown; newValue: unknown }> = {};
    if (update.status && update.status !== task.status) {
      changes.status = { oldValue: task.status, newValue: update.status };
    }
    if (reassignedTo) {
      changes.assignedTo = { oldValue: task.assignedTo, newValue: reassignedTo.id };
    }

    await createActivityLog({
      userId: updatedByUserId,
      action: update.status === "completed" ? "task-completed" : "task-updated",
      description: reassignedTo
        ? `Reassigned task "${task.title}" to ${reassignedTo.name}`
        : `Updated task "${task.title}"`,
      entityType: "task",
      entityId: taskId,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    if (reassignedTo) {
      const due = timestampToDate((update.dueDate || task.dueDate) as TimestampInput) || new Date();
      await notifyAssignee({ id: taskId, title: update.title || task.title, dueDate: due }, reassignedTo, updatedByUserId);
    }

    if (update.status === "completed" && task.assignedBy !== task.assignedTo && task.assignedBy !== updatedByUserId) {
      try {
        if (await isNotificationEnabled(task.assignedBy, "task-completed")) {
          const [assignee, assigner] = await Promise.all([
            getDocById<User>("users", task.assignedTo),
            getDocById<User>("users", task.assignedBy),
          ]);
          await createNotification({
            userId: task.assignedBy,
            type: "task-completed",
            title: `${assignee?.name || "Someone"} completed a task`,
            message: task.title,
            relatedId: taskId,
            relatedType: "task",
            actionUrl: assigner ? TASKS_ROUTE_BY_ROLE[assigner.role] : undefined,
          });
        }
      } catch (error) {
        logger.error(`Failed to notify ${task.assignedBy} of task completion`, error);
      }
    }

    logger.info(`Task updated: ${taskId}`);
    return (await getTaskById(taskId))!;
  } catch (error) {
    logger.error(`Error updating task ${taskId}`, error);
    throw error;
  }
}

/** Whether finishing a task needs its assigner's sign-off (not for tasks you set yourself). */
export function needsReview(task: Pick<Task, "assignedBy" | "assignedTo">): boolean {
  return task.assignedBy !== task.assignedTo;
}

/**
 * The assignee hands in their work: a note plus optional PDFs. The task then
 * waits in "submitted" until its assigner accepts it or asks for changes (see
 * reviewTask); a task you assigned yourself completes straight away.
 * `assigneeId` is who the work is submitted as; `actorUserId` who actually did it.
 */
export async function submitTask(
  taskId: string,
  input: { note: string; attachments: ReportAttachment[] },
  assigneeId: string,
  actorUserId: string = assigneeId
): Promise<Task> {
  const task = await getTaskById(taskId);
  if (!task) throw new NotFoundError(`Task ${taskId} not found`);
  if (task.assignedTo !== assigneeId) throw new AuthorizationError("Only the person this task is assigned to can submit it");
  if (task.status === "cancelled") throw new ConflictError("This task was cancelled");
  if (needsReview(task) && task.status === "completed") throw new ConflictError("This task was already accepted");
  await requireOwnAttachments(input.attachments, assigneeId);

  const submission: TaskSubmission = { ...input, submittedBy: assigneeId, submittedAt: new Date() };

  if (!needsReview(task)) {
    await updateDoc<Task>("tasks", taskId, { submission } as Partial<Task>);
    return task.status === "completed"
      ? (await getTaskById(taskId))!
      : updateTask(taskId, { status: "completed" }, actorUserId);
  }

  await updateDoc<Task>("tasks", taskId, { submission, status: "submitted" } as Partial<Task>);

  await createActivityLog({
    userId: actorUserId,
    action: "task-updated",
    description: `Submitted task "${task.title}" for review`,
    entityType: "task",
    entityId: taskId,
    changes: task.status !== "submitted" ? { status: { oldValue: task.status, newValue: "submitted" } } : undefined,
  });

  try {
    if (await isNotificationEnabled(task.assignedBy, "task-completed")) {
      const [assignee, assigner] = await Promise.all([
        getDocById<User>("users", task.assignedTo),
        getDocById<User>("users", task.assignedBy),
      ]);
      await createNotification({
        userId: task.assignedBy,
        type: "task-completed",
        title: `${assignee?.name || "Someone"} submitted a task for your review`,
        message: task.title,
        relatedId: taskId,
        relatedType: "task",
        actionUrl: assigner ? TASKS_ROUTE_BY_ROLE[assigner.role] : undefined,
      });
    }
  } catch (error) {
    logger.error(`Failed to notify ${task.assignedBy} of task submission`, error);
  }

  return (await getTaskById(taskId))!;
}

/**
 * The assigner's decision on submitted work: accepting completes the task;
 * asking for changes sends it back to the assignee with feedback, and they
 * submit again. `reviewerId` is who reviews (shown); `actorUserId` who did it.
 */
export async function reviewTask(
  taskId: string,
  input: { decision: "accept" | "request-changes"; note?: string },
  reviewerId: string,
  actorUserId: string = reviewerId
): Promise<Task> {
  const task = await getTaskById(taskId);
  if (!task) throw new NotFoundError(`Task ${taskId} not found`);
  if (task.status !== "submitted") throw new ConflictError(`"${task.title}" isn't waiting for review`);

  const accepted = input.decision === "accept";
  const note = input.note?.trim() || undefined;
  if (!accepted && !note) throw new ValidationError("Say what needs to change");

  const review: TaskReview = {
    decision: accepted ? "accepted" : "changes-requested",
    note,
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
  };
  const status: TaskStatus = accepted ? "completed" : "changes-requested";
  await updateDoc<Task>("tasks", taskId, {
    status,
    review,
    completedDate: accepted ? new Date() : null,
  } as unknown as Partial<Task>);

  await createActivityLog({
    userId: actorUserId,
    action: accepted ? "task-completed" : "task-updated",
    description: accepted ? `Accepted task "${task.title}"` : `Asked for changes on task "${task.title}"`,
    entityType: "task",
    entityId: taskId,
    changes: { status: { oldValue: task.status, newValue: status } },
  });

  try {
    const [assignee, reviewer] = await Promise.all([
      getDocById<User>("users", task.assignedTo),
      getDocById<User>("users", reviewerId),
    ]);
    if (assignee) {
      await createNotification({
        userId: assignee.id,
        type: "task-reviewed",
        title: accepted
          ? `${reviewer?.name || "Your reviewer"} accepted your task`
          : `${reviewer?.name || "Your reviewer"} asked for changes`,
        message: note ? `${task.title} · ${note}` : task.title,
        relatedId: taskId,
        relatedType: "task",
        actionUrl: TASKS_ROUTE_BY_ROLE[assignee.role],
      });
    }
  } catch (error) {
    logger.error(`Failed to notify ${task.assignedTo} of task review`, error);
  }

  return (await getTaskById(taskId))!;
}

export async function deleteTask(taskId: string, deletedByUserId: string): Promise<void> {
  try {
    const task = await getDocById<Task>("tasks", taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    await deleteDocFromFirestore("tasks", taskId);

    await createActivityLog({
      userId: deletedByUserId,
      action: "other",
      description: `Deleted task "${task.title}"`,
      entityType: "task",
      entityId: taskId,
    });

    logger.info(`Task deleted: ${taskId}`);
  } catch (error) {
    logger.error(`Error deleting task ${taskId}`, error);
    throw error;
  }
}
