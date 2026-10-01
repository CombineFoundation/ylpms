import { apiFetch } from "@/lib/api-client";
import { scopedPath, type ScopedRole } from "@/hooks/usePortalScope";
import { endOfLocalDayIso } from "@/components/Head-of-RO/tasks/task-display.types";
import type { SroTaskForm } from "./sro-task.types";

/**
 * Creates a task, or updates `taskId` when given. Shared by the SRO/RO Tasks pages and Assigned ROs.
 * `actingAsId` is set when a developer is acting as that SRO/RO, so new tasks are assigned as them.
 */
export function saveSroTask(
  values: SroTaskForm,
  taskId?: string,
  actingAsId: string | null = null,
  portal: ScopedRole = "sro"
) {
  const body = {
    title: values.title,
    description: values.description,
    priority: values.priority,
    dueDate: endOfLocalDayIso(values.dueDate),
    assignedTo: values.assignedTo,
  };
  // Only sent when the form offered the activity picker; on edit, "" removes the link.
  const eventId = values.eventId === undefined ? undefined : values.eventId || (taskId ? null : undefined);
  return taskId
    ? apiFetch(`/api/tasks/${taskId}`, { method: "PATCH", body: { ...body, eventId } })
    : apiFetch(scopedPath("/api/tasks", portal, actingAsId), { method: "POST", body: { ...body, eventId } });
}
