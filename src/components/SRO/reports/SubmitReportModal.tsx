"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { AttachedPdfList, PdfAttachmentPicker, ReviewerFeedback } from "@/components/shared/PdfAttachmentPicker";
import { zodResolver } from "@/lib/zod-resolver";
import { FieldError, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { reportTypeLabels, type ApiReport } from "@/components/Head-of-RO/reports/report-display.types";
import { MAX_REPORT_ATTACHMENTS } from "@/lib/report-attachments";
import { submitReportSchema, toReportForm, type SubmitReportForm } from "./submit-report.types";
import type { ReportAttachment } from "@/types/report.types";

type SubmitReportModalProps = {
  isOpen: boolean;
  error: string | null;
  /** e.g. "Uploading 1 of 2 PDFs..." while the parent uploads before submitting. */
  progress?: string | null;
  onClose: () => void;
  /** `kept`: the PDFs already on a returned report that stay attached. */
  onSubmit: (values: SubmitReportForm, files: File[], kept: ReportAttachment[]) => Promise<void>;
  /** Who receives and reviews the report. */
  reviewer?: string;
  /** A returned report being edited and resubmitted; prefills the form. */
  editing?: ApiReport | null;
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
export function SubmitReportModal({
  isOpen,
  error,
  progress,
  onClose,
  onSubmit,
  reviewer = "Head RO",
  editing = null,
}: SubmitReportModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitReportForm>({ resolver: zodResolver(submitReportSchema), defaultValues: EMPTY_FORM });
  const [files, setFiles] = useState<File[]>([]);
  const [kept, setKept] = useState<ReportAttachment[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    reset(editing ? toReportForm(editing) : EMPTY_FORM);
    setFiles([]);
    setKept(editing?.content?.attachments ?? []);
  }, [isOpen, editing, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={editing ? "Edit & resubmit report" : `Submit Report to ${reviewer}`}
      description={
        editing
          ? `Make the changes the ${reviewer} asked for, then send it back for review.`
          : `The ${reviewer} will review it and can approve or send it back with feedback.`
      }
      onClose={onClose}
      isBusy={isSubmitting}
      size="lg"
    >
      <form onSubmit={handleSubmit((values) => onSubmit(values, files, kept))} className="space-y-4" noValidate>
        <ReviewerFeedback title={`${reviewer} feedback`} message={editing?.reviewComment} />
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
            placeholder={"Volunteers trained: 25\nActivities held: 4"}
            {...register("metrics")}
            className={inputClass}
            aria-invalid={!!errors.metrics}
          />
          <FieldError message={errors.metrics?.message} />
        </label>
        <AttachedPdfList attachments={kept} onChange={setKept} disabled={isSubmitting} />
        <PdfAttachmentPicker
          files={files}
          onChange={setFiles}
          disabled={isSubmitting}
          label={kept.length ? "Add PDFs" : undefined}
          maxFiles={MAX_REPORT_ATTACHMENTS - kept.length}
        />
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
            {isSubmitting ? "Submitting..." : editing ? `Resubmit to ${reviewer}` : `Submit to ${reviewer}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
