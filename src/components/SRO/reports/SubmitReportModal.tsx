"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { PdfAttachmentPicker } from "@/components/shared/PdfAttachmentPicker";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { reportTypeLabels } from "@/components/Head-of-RO/reports/report-display.types";
import { submitReportSchema, type SubmitReportForm } from "./submit-report.types";

type SubmitReportModalProps = {
  isOpen: boolean;
  error: string | null;
  /** e.g. "Uploading 1 of 2 PDFs..." while the parent uploads before submitting. */
  progress?: string | null;
  onClose: () => void;
  onSubmit: (values: SubmitReportForm, files: File[]) => Promise<void>;
  /** Who receives and reviews the report. */
  reviewer?: string;
};

const EMPTY_FORM: SubmitReportForm = {
  title: "",
  type: "monthly",
  startDate: "",
  endDate: "",
  summary: "",
  achievements: "",
  challenges: "",
  metrics: "",
};

/** A manager submits a report to their reviewer (SRO → Head RO, RO → SRO). */
export function SubmitReportModal({ isOpen, error, progress, onClose, onSubmit, reviewer = "Head RO" }: SubmitReportModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitReportForm>({ resolver: zodResolver(submitReportSchema), defaultValues: EMPTY_FORM });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    reset(EMPTY_FORM);
    setFiles([]);
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={`Submit Report to ${reviewer}`}
      description={`The ${reviewer} will review it and can approve or send it back with feedback.`}
      onClose={onClose}
      isBusy={isSubmitting}
      size="lg"
    >
      <form onSubmit={handleSubmit((values) => onSubmit(values, files))} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
          <label className="block text-sm font-medium text-gray-700">
            Title
            <input {...register("title")} className={inputClass} aria-invalid={!!errors.title} />
            <FieldError message={errors.title?.message} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Type
            <select {...register("type")} className={inputClass}>
              {Object.entries(reportTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Period start
            <input type="date" {...register("startDate")} className={inputClass} aria-invalid={!!errors.startDate} />
            <FieldError message={errors.startDate?.message} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Period end
            <input type="date" {...register("endDate")} className={inputClass} aria-invalid={!!errors.endDate} />
            <FieldError message={errors.endDate?.message} />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Summary
          <textarea rows={3} {...register("summary")} className={inputClass} aria-invalid={!!errors.summary} />
          <FieldError message={errors.summary?.message} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Achievements <span className="font-normal text-gray-400">(one per line)</span>
            <textarea rows={4} {...register("achievements")} className={inputClass} aria-invalid={!!errors.achievements} />
            <FieldError message={errors.achievements?.message} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Challenges <span className="font-normal text-gray-400">(one per line)</span>
            <textarea rows={4} {...register("challenges")} className={inputClass} aria-invalid={!!errors.challenges} />
            <FieldError message={errors.challenges?.message} />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Metrics <span className="font-normal text-gray-400">(optional, one &quot;Label: number&quot; per line)</span>
          <textarea
            rows={3}
            placeholder={"Volunteers trained: 25\nEvents held: 4"}
            {...register("metrics")}
            className={inputClass}
            aria-invalid={!!errors.metrics}
          />
          <FieldError message={errors.metrics?.message} />
        </label>
        <PdfAttachmentPicker files={files} onChange={setFiles} disabled={isSubmitting} />
        {progress && isSubmitting && <p className="text-sm text-gray-500">{progress}</p>}
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
            {isSubmitting ? "Submitting..." : `Submit to ${reviewer}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
