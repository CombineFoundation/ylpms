"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { toDateInputValue } from "@/components/Head-of-RO/tasks/task-display.types";
import {
  assigneeRoleLabels,
  sroEditTaskFormSchema,
  sroTaskFormSchema,
  type Assignee,
  type OpenActivity,
  type SroTaskForm,
  type SroTaskRow,
} from "./sro-task.types";

type SroTaskFormModalProps = {
  isOpen: boolean;
  editingTask: SroTaskRow | null;
  /** People the SRO can assign to (their team). */
  assignees: Assignee[];
  /** Pre-selects the assignee for a new task, e.g. from an RO's row. */
  defaultAssigneeId?: string;
  /** The assigner's open activities; when given, the task can be linked to one. */
  activities?: OpenActivity[];
  error: string | null;
  onClose: () => void;
  onSubmit: (values: SroTaskForm) => Promise<void>;
};

const EMPTY_FORM: SroTaskForm = { title: "", description: "", assignedTo: "", dueDate: "", priority: "medium", eventId: "" };

export function SroTaskFormModal({
  isOpen,
  editingTask,
  assignees,
  defaultAssigneeId,
  activities = [],
  error,
  onClose,
  onSubmit,
}: SroTaskFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SroTaskForm>({
    resolver: zodResolver(editingTask ? sroEditTaskFormSchema : sroTaskFormSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      editingTask
        ? {
            title: editingTask.title,
            description: editingTask.description,
            assignedTo: editingTask.assigneeId,
            dueDate: editingTask.dueDateInputValue,
            priority: editingTask.priority,
            eventId: editingTask.eventId ?? "",
          }
        : { ...EMPTY_FORM, assignedTo: defaultAssigneeId ?? "" }
    );
  }, [isOpen, editingTask, defaultAssigneeId, reset]);

  const groups = useMemo(() => {
    const byRole = new Map<string, Assignee[]>();
    assignees.forEach((person) => byRole.set(person.role, [...(byRole.get(person.role) ?? []), person]));
    return [...byRole.entries()];
  }, [assignees]);

  // Keep an edited task's current link selectable even if that activity has since closed.
  const activityOptions = useMemo(() => {
    const linked = editingTask?.eventId;
    return linked && !activities.some((a) => a.id === linked)
      ? [{ id: linked, title: `${editingTask.eventTitle ?? "Linked activity"} (closed)` }, ...activities]
      : activities;
  }, [activities, editingTask]);
  const showActivities = activityOptions.length > 0;

  return (
    <Modal isOpen={isOpen} title={editingTask ? "Edit Task" : "Assign New Task"} onClose={onClose} isBusy={isSubmitting}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <label className="block text-sm font-medium text-gray-700">
          Title
          <input {...register("title")} className={inputClass} aria-invalid={!!errors.title} />
          <FieldError message={errors.title?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Description
          <textarea rows={3} {...register("description")} className={inputClass} aria-invalid={!!errors.description} />
          <FieldError message={errors.description?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Assign to
          <select {...register("assignedTo")} className={inputClass} aria-invalid={!!errors.assignedTo}>
            <option value="">{assignees.length === 0 ? "No team members yet" : "Select a person"}</option>
            {groups.map(([role, people]) => (
              <optgroup key={role} label={assigneeRoleLabels[role as Assignee["role"]] ?? role}>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <FieldError message={errors.assignedTo?.message} />
        </label>
        {showActivities && (
          <label className="block text-sm font-medium text-gray-700">
            Related activity (optional)
            <select {...register("eventId")} className={inputClass}>
              <option value="">Not linked to an activity</option>
              {activityOptions.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Due date
            <input
              type="date"
              min={editingTask ? undefined : toDateInputValue(new Date())}
              {...register("dueDate")}
              className={inputClass}
              aria-invalid={!!errors.dueDate}
            />
            <FieldError message={errors.dueDate?.message} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Priority
            <select {...register("priority")} className={inputClass}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : editingTask ? "Save changes" : "Assign Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
