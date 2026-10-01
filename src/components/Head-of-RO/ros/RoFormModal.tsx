"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { UniversitySelect } from "@/components/shared/PlaceSelects";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "../shared/ListParts";
import { ManagerSelect } from "../shared/ManagerSelect";
import { createRoFormSchema, roFormSchema, type Ro, type RoForm } from "./ro.types";

type RoFormModalProps = {
  isOpen: boolean;
  editingRo: Ro | null;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: RoForm) => Promise<void>;
};

export function RoFormModal({ isOpen, editingRo, error, onClose, onSubmit }: RoFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoForm>({
    resolver: zodResolver(editingRo ? roFormSchema : createRoFormSchema),
    defaultValues: { email: "", memberId: "", name: "", region: "", university: "", sroId: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        editingRo
          ? {
              email: editingRo.email,
              memberId: editingRo.memberId,
              name: editingRo.name,
              region: editingRo.region,
              university: editingRo.university,
              sroId: editingRo.reportingToId,
            }
          : { email: "", memberId: "", name: "", region: "", university: "", sroId: "" }
      );
    }
  }, [isOpen, editingRo, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={editingRo ? "Edit Reporting Officer" : "Add New Reporting Officer"}
      description={editingRo ? undefined : "They'll receive an email with a temporary password."}
      onClose={onClose}
      isBusy={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <label className="block text-sm font-medium text-gray-700">
          Email address
          <input type="email" disabled={!!editingRo} {...register("email")} className={inputClass} aria-invalid={!!errors.email} />
          {editingRo && <span className="mt-1 block text-xs font-normal text-gray-400">Email can&apos;t be changed.</span>}
          <FieldError message={errors.email?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          ID
          <input
            {...register("memberId")}
            placeholder="e.g. CF-RO-001"
            className={`${inputClass} uppercase`}
            aria-invalid={!!errors.memberId}
          />
          {editingRo && !editingRo.memberId && (
            <span className="mt-1 block text-xs font-normal text-gray-400">This account has no ID yet. Add one here.</span>
          )}
          <FieldError message={errors.memberId?.message} />
        </label>
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
        <label className="block text-sm font-medium text-gray-700">
          University (optional)
          <Controller
            control={control}
            name="university"
            render={({ field }) => (
              <UniversitySelect
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={inputClass}
                invalid={!!errors.university}
              />
            )}
          />
          <FieldError message={errors.university?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Reports to (SRO)
          <Controller
            control={control}
            name="sroId"
            render={({ field }) => <ManagerSelect roles={["sro"]} value={field.value} onChange={field.onChange} />}
          />
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
            {isSubmitting ? "Saving..." : editingRo ? "Save changes" : "Add RO"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
