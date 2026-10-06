import { z } from "zod";
import type { UserRole } from "@/types/user.types";
import type { TimestampInput } from "@/utils/user-status";
import {
  editTaskFormSchema,
  taskFormSchema,
  toTaskRow,
  type ApiTask,
  type TaskRow,
} from "@/components/Head-of-RO/tasks/task-display.types";

/** A task from GET /api/sro/tasks (assignee and assigner names resolved server-side). */
export type ApiSroTask = ApiTask & { assignedBy: string; assignerName: string };

export type Assignee = { id: string; name: string; role: UserRole };

/** One of the assigner's open activities a task can be linked to. */
export type OpenActivity = { id: string; title: string; startDate?: TimestampInput };

export type SroTasksResponse = {
  assignedToMe: ApiSroTask[];
  assignedByMe: ApiSroTask[];
  /** SROs only: their youth leaders' monthly tasks (view only; each youth leader's RO reviews them). */
  teamMonthly?: ApiSroTask[];
  assignees: Assignee[];
  /** Only filled for youth leaders. */
  openActivities?: OpenActivity[];
};

export type SroTaskRow = TaskRow & { assignerName: string };

export function toSroTaskRow(task: ApiSroTask): SroTaskRow {
  return { ...toTaskRow(task), assignerName: task.assignerName };
}

/** The SRO picks the assignee straight from their team list, so no role picker. */
// `eventId`: "" = not linked to an activity.
export const sroTaskFormSchema = taskFormSchema.omit({ assigneeRole: true }).extend({ eventId: z.string().optional() });
export const sroEditTaskFormSchema = editTaskFormSchema.omit({ assigneeRole: true }).extend({ eventId: z.string().optional() });
export type SroTaskForm = z.infer<typeof sroTaskFormSchema>;

export const assigneeRoleLabels: Partial<Record<UserRole, string>> = {
  ro: "Reporting Officers",
  "youth-leader": "Youth Leaders",
  volunteer: "Volunteers",
};
