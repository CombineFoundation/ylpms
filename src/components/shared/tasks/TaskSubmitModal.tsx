"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { uploadReportPdf } from "@/lib/report-attachments";
import { zodResolver } from "@/lib/zod-resolver";
import { scopedPath } from "@/hooks/usePortalScope";
import type { ScopedRole } from "@/utils/portal-scope";
import { Modal } from "@/components/ui/Modal";
import { FieldError, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { AttachedPdfList, PdfAttachmentPicker, ReviewerFeedback } from "@/components/shared/PdfAttachmentPicker";
import { MAX_REPORT_ATTACHMENTS } from "@/lib/report-attachments";
import type { ReportAttachment } from "@/types/report.types";
import type { TaskStatus } from "@/types/task.types";

const submitFormSchema = z.object({
  note: z.string().trim().min(5, "Describe what you did in at least 5 characters").max(3000),
});
type SubmitForm = z.infer<typeof submitFormSchema>;

type TaskSubmitModalProps = {
  /** `submission` / `review`: the earlier hand-in and its feedback, when resubmitting after changes were asked for. */
  task: {
    id: string;
    title: string;
    assignerName: string;
    submission?: { note: string; attachments?: ReportAttachment[] };
    review?: { decision: string; note?: string };
  } | null;
  /** The portal it's submitted from; `selectedId` is set when a developer acts as someone. */
  portal: ScopedRole;
  selectedId: string | null;
  onClose: () => void;
  onSubmitted: (taskId: string, status: TaskStatus) => void;
};

/** The assignee hands in their work (a note and optional PDFs) for the assigner to review. */
export function TaskSubmitModal({ task, portal, selectedId, onClose, onSubmitted }: TaskSubmitModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [kept, setKept] = useState<ReportAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitForm>({ resolver: zodResolver(submitFormSchema), defaultValues: { note: "" } });

  useEffect(() => {
    if (!task) return;
    // Resubmitting starts from the earlier hand-in, so only what needs changing has to be redone.
    reset({ note: task.submission?.note ?? "" });
    setKept(task.submission?.attachments ?? []);
    setFiles([]);
    setError(null);
  }, [task, reset]);

  const onSubmit = handleSubmit(async ({ note }) => {
    if (!task) return;
    setError(null);
    try {
      const actingAs = selectedId ? { role: portal, id: selectedId } : null;
      const attachments = [...kept];
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading PDF ${index + 1} of ${files.length}...`);
        attachments.push(await uploadReportPdf(file, actingAs));
      }
      setProgress("Submitting...");
      const updated = await apiFetch<{ status: TaskStatus }>(scopedPath(`/api/tasks/${task.id}/submit`, portal, selectedId), {
        method: "POST",
        body: { note, attachments },
      });
      onSubmitted(task.id, updated?.status ?? "completed");
    } catch (err) {
      setError(errorMessage(err, "Unable to submit this task."));
    } finally {
      setProgress(null);
    }
  });

  return (
    <Modal
      isOpen={!!task}
      title={task ? `Submit “${task.title}”` : "Submit task"}
      description={
        task
          ? `${task.assignerName} reviews what you hand in, then accepts it or asks for changes. The task is done once it's accepted.`
          : undefined
      }
      onClose={onClose}
      isBusy={isSubmitting}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {task?.review?.decision === "changes-requested" && (
          <ReviewerFeedback title={`${task.assignerName} asked for changes`} message={task.review.note} />
        )}
        <label className="block text-sm font-medium text-gray-700">
          What did you do?
          <textarea
            rows={4}
            placeholder="Summarize the work, results, and anything the reviewer should know..."
            {...register("note")}
            className={inputClass}
            aria-invalid={!!errors.note}
          />
          <FieldError message={errors.note?.message} />
        </label>
        <AttachedPdfList attachments={kept} onChange={setKept} disabled={isSubmitting} />
        <PdfAttachmentPicker
          files={files}
          onChange={setFiles}
          disabled={isSubmitting}
          label={kept.length ? "Add more proof (PDF)" : "Proof of work (PDF)"}
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
            {isSubmitting ? "Submitting..." : "Submit for review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
