"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { CitySelect, UniversitySelect } from "@/components/shared/PlaceSelects";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "../shared/ListParts";
import { ManagerSelect } from "../shared/ManagerSelect";
import { memberIdSchema } from "@/utils/member-id";
import { cityField, universityField } from "@/utils/places";

const addYouthLeaderSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  memberId: memberIdSchema,
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  /** The youth leader's city (stored as their region). */
  region: cityField(true),
  university: universityField(true),
  roId: z.string(),
});

export type AddYouthLeaderForm = z.infer<typeof addYouthLeaderSchema>;

const EMPTY_FORM: AddYouthLeaderForm = { email: "", memberId: "", name: "", region: "", university: "", roId: "" };

type AddYouthLeaderModalProps = {
  isOpen: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: AddYouthLeaderForm) => Promise<void>;
};

/** Head RO creates a youth leader directly (no SRO approval, unlike an RO's request). */
export function AddYouthLeaderModal({ isOpen, error, onClose, onSubmit }: AddYouthLeaderModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddYouthLeaderForm>({ resolver: zodResolver(addYouthLeaderSchema), defaultValues: EMPTY_FORM });

  useEffect(() => {
    if (isOpen) reset(EMPTY_FORM);
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title="Add New Youth Leader"
      description="They'll receive an email with a temporary password."
      onClose={onClose}
      isBusy={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <label className="block text-sm font-medium text-gray-700">
          Email address
          <input type="email" {...register("email")} className={inputClass} aria-invalid={!!errors.email} />
          <FieldError message={errors.email?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          ID
          <input
            {...register("memberId")}
            placeholder="e.g. CF-YL-001"
            className={`${inputClass} uppercase`}
            aria-invalid={!!errors.memberId}
          />
          <FieldError message={errors.memberId?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Full name
          <input {...register("name")} className={inputClass} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          City
          <Controller
            control={control}
            name="region"
            render={({ field }) => (
              <CitySelect
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={inputClass}
                invalid={!!errors.region}
              />
            )}
          />
          <FieldError message={errors.region?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          University
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
          Reports to (RO)
          <Controller
            control={control}
            name="roId"
            render={({ field }) => <ManagerSelect roles={["ro"]} value={field.value} onChange={field.onChange} />}
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
            {isSubmitting ? "Saving..." : "Add Youth Leader"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
