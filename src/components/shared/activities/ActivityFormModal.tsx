"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import {
  createActivityFormSchema,
  editActivityFormSchema,
  toDateTimeInputValue,
  typeLabels,
  modeLabels,
  type ActivityForm,
  type ApiActivity,
} from "./activity.types";

type ActivityFormModalProps = {
  isOpen: boolean;
  editing: ApiActivity | null;
  /** Youth leaders' activities start as drafts that go to their RO for approval. */
  needsApproval: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: ActivityForm) => Promise<void>;
};

const EMPTY_FORM: ActivityForm = {
  title: "",
  description: "",
  type: "volunteer-event",
  mode: "onsite",
  startDate: "",
  endDate: "",
  location: "",
  maxAttendees: "",
};

export function ActivityFormModal({ isOpen, editing, needsApproval, error, onClose, onSubmit }: ActivityFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityForm>({
    resolver: zodResolver(editing ? editActivityFormSchema : createActivityFormSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      editing
        ? {
            title: editing.title,
            description: editing.description,
            type: editing.type,
            mode: editing.mode ?? "onsite",
            startDate: toDateTimeInputValue(editing.startDate),
            endDate: toDateTimeInputValue(editing.endDate),
            location: editing.location,
            maxAttendees: editing.maxAttendees ? String(editing.maxAttendees) : "",
          }
        : EMPTY_FORM
    );
  }, [isOpen, editing, reset]);

  const createLabel = needsApproval ? "Save draft" : "Create activity";

  return (
    <Modal
      isOpen={isOpen}
      title={editing ? "Edit activity" : "New activity"}
      description={
        !editing && needsApproval
          ? "It's saved as a draft. Submit it when it's ready, and your RO will review and approve it."
          : undefined
      }
      onClose={onClose}
      isBusy={isSubmitting}
    >
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Type
            <select {...register("type")} className={inputClass}>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Format
            <select {...register("mode")} className={inputClass}>
              {Object.entries(modeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Location {watch("mode") === "online" && <span className="font-normal text-gray-400">(platform or link)</span>}
          <input {...register("location")} className={inputClass} aria-invalid={!!errors.location} />
          <FieldError message={errors.location?.message} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Starts
            <input type="datetime-local" {...register("startDate")} className={inputClass} aria-invalid={!!errors.startDate} />
            <FieldError message={errors.startDate?.message} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Ends
            <input type="datetime-local" {...register("endDate")} className={inputClass} aria-invalid={!!errors.endDate} />
            <FieldError message={errors.endDate?.message} />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Max attendees (optional)
          <input type="number" min={1} step={1} {...register("maxAttendees")} className={inputClass} aria-invalid={!!errors.maxAttendees} />
          <span className="mt-1 block text-xs font-normal text-gray-400">Leave empty for no limit.</span>
          <FieldError message={errors.maxAttendees?.message} />
        </label>
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
            {isSubmitting ? "Saving..." : editing ? "Save changes" : createLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
