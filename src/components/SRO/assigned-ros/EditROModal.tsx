"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { editROFormSchema, type AssignedRO, type EditROForm } from "./assigned-ro.types";

type EditROModalProps = {
  ro: AssignedRO | null;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: EditROForm) => Promise<void>;
};

export function EditROModal({ ro, error, onClose, onSubmit }: EditROModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditROForm>({ resolver: zodResolver(editROFormSchema), defaultValues: { name: "", region: "" } });

  useEffect(() => {
    if (ro) reset({ name: ro.name, region: ro.region || "" });
  }, [ro, reset]);

  return (
    <Modal isOpen={!!ro} title="Edit Reporting Officer" description={ro?.email} onClose={onClose} isBusy={isSubmitting}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <label className="block text-sm font-medium text-gray-700">
          Full name
          <input {...register("name")} className={inputClass} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Region
          <input {...register("region")} className={inputClass} aria-invalid={!!errors.region} />
          <FieldError message={errors.region?.message} />
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
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
