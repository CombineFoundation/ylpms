"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "../shared/ListParts";
import { ManagerSelect } from "../shared/ManagerSelect";
import {
  ASSIGNEE_ROLES,
  editTaskFormSchema,
  taskFormSchema,
  toDateInputValue,
  type TaskForm,
  type TaskRow,
} from "./task-display.types";

type TaskFormModalProps = {
  isOpen: boolean;
  editingTask: TaskRow | null;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: TaskForm) => Promise<void>;
};

const EMPTY_FORM: TaskForm = {
  title: "",
  description: "",
  assigneeRole: "ro",
  assignedTo: "",
  dueDate: "",
  priority: "medium",
};

export function TaskFormModal({ isOpen, editingTask, error, onClose, onSubmit }: TaskFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskForm>({
    resolver: zodResolver(editingTask ? editTaskFormSchema : taskFormSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!isOpen) return;
    const role = editingTask?.assigneeRole;
    reset(
      editingTask
        ? {
            title: editingTask.title,
            description: editingTask.description,
            assigneeRole: role && role !== "developer" && role !== "head-ro" ? role : "ro",
            assignedTo: editingTask.assigneeId,
            dueDate: editingTask.dueDateInputValue,
            priority: editingTask.priority,
          }
        : EMPTY_FORM
    );
  }, [isOpen, editingTask, reset]);

  const assigneeRole = watch("assigneeRole");

  return (
    <Modal isOpen={isOpen} title={editingTask ? "Edit Task" : "Add New Task"} onClose={onClose} isBusy={isSubmitting}>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
          <label className="block text-sm font-medium text-gray-700">
            Role
            <select
              {...register("assigneeRole", { onChange: () => setValue("assignedTo", "") })}
              className={inputClass}
            >
              {ASSIGNEE_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Assign to
            <Controller
              control={control}
              name="assignedTo"
              render={({ field }) => (
                <ManagerSelect
                  roles={[assigneeRole]}
                  value={field.value}
                  onChange={field.onChange}
                  allowUnassigned={false}
                  placeholder="Select a person"
                />
              )}
            />
            <FieldError message={errors.assignedTo?.message} />
          </label>
        </div>
        {editingTask && (
          <p className="-mt-2 text-xs text-gray-400">Changing the assignee notifies the new person.</p>
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
            {isSubmitting ? "Saving..." : editingTask ? "Save changes" : "Add Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
