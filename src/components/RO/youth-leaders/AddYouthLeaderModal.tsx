"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { CitySelect, UniversitySelect } from "@/components/shared/PlaceSelects";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import {
  addVolunteerFormSchema,
  addYouthLeaderFormSchema,
  addYouthLeaderWithIdFormSchema,
  type AddYouthLeaderForm,
} from "./youth-leader.types";

type AddYouthLeaderModalProps = {
  isOpen: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: AddYouthLeaderForm) => Promise<void>;
  title?: string;
  /** Who approves the request, e.g. "SRO" (for a youth leader) or "RO" (for a volunteer). */
  approver?: string;
  /** Ask for the new member's ID (youth leaders; a volunteer's ID is entered by the approving RO). */
  askForId?: boolean;
  /** Ask for the volunteer's role in the team (youth leaders requesting volunteers). */
  askForTeamRole?: boolean;
};

const EMPTY_FORM: AddYouthLeaderForm = { name: "", email: "", phone: "", region: "", university: "", memberId: "", teamRole: "" };

/** Submits a request to the requester's manager; the account is only created once they approve. */
export function AddYouthLeaderModal({
  isOpen,
  error,
  onClose,
  onSubmit,
  title = "Add Youth Leader",
  approver = "SRO",
  askForId = false,
  askForTeamRole = false,
}: AddYouthLeaderModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddYouthLeaderForm>({
    resolver: zodResolver(
      askForId ? addYouthLeaderWithIdFormSchema : askForTeamRole ? addVolunteerFormSchema : addYouthLeaderFormSchema
    ),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (isOpen) reset(EMPTY_FORM);
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={`Your ${approver} must approve this before the account is created and sign-in details are emailed.`}
      onClose={onClose}
      isBusy={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <label className="block text-sm font-medium text-gray-700">
          Full name
          <input {...register("name")} className={inputClass} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </label>
        {askForId && (
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
        )}
        {askForTeamRole && (
          <label className="block text-sm font-medium text-gray-700">
            Team role
            <input
              {...register("teamRole")}
              placeholder="e.g. Media, Logistics, Coordinator"
              className={inputClass}
              aria-invalid={!!errors.teamRole}
            />
            <FieldError message={errors.teamRole?.message} />
          </label>
        )}
        <label className="block text-sm font-medium text-gray-700">
          Email address
          <input type="email" {...register("email")} className={inputClass} aria-invalid={!!errors.email} />
          <FieldError message={errors.email?.message} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Phone (optional)
            <input type="tel" {...register("phone")} className={inputClass} aria-invalid={!!errors.phone} />
            <FieldError message={errors.phone?.message} />
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
        </div>
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
            {isSubmitting ? "Sending..." : "Send for approval"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
