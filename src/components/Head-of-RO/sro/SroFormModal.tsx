"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { UniversitySelect } from "@/components/shared/PlaceSelects";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "../shared/ListParts";
import { createSroFormSchema, sroFormSchema, type Sro, type SroForm } from "./sro.types";

type SroFormModalProps = {
  isOpen: boolean;
  editingSro: Sro | null;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: SroForm) => Promise<void>;
};

export function SroFormModal({ isOpen, editingSro, error, onClose, onSubmit }: SroFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SroForm>({
    resolver: zodResolver(editingSro ? sroFormSchema : createSroFormSchema),
    defaultValues: { email: "", memberId: "", name: "", region: "", university: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        editingSro
          ? {
              email: editingSro.email,
              memberId: editingSro.memberId,
              name: editingSro.name,
              region: editingSro.region,
              university: editingSro.university,
            }
          : { email: "", memberId: "", name: "", region: "", university: "" }
      );
    }
  }, [isOpen, editingSro, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={editingSro ? "Edit SRO" : "Add New SRO"}
      description={editingSro ? undefined : "They'll receive an email with a temporary password."}
      onClose={onClose}
      isBusy={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <label className="block text-sm font-medium text-gray-700">
          Email address
          <input
            type="email"
            disabled={!!editingSro}
            {...register("email")}
            className={inputClass}
            aria-invalid={!!errors.email}
          />
          {editingSro && <span className="mt-1 block text-xs font-normal text-gray-400">Email can&apos;t be changed.</span>}
          <FieldError message={errors.email?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          ID
          <input
            {...register("memberId")}
            placeholder="e.g. CF-SRO-001"
            className={`${inputClass} uppercase`}
            aria-invalid={!!errors.memberId}
          />
          {editingSro && !editingSro.memberId && (
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
            {isSubmitting ? "Saving..." : editingSro ? "Save changes" : "Add SRO"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
