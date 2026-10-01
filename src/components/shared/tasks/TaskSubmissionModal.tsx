"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { formatFileSize, openAuthenticatedPdf } from "@/lib/report-attachments";
import { formatRelativeTime } from "@/utils/user-status";
import { Modal } from "@/components/ui/Modal";
import type { ApiTaskSubmission } from "@/components/Head-of-RO/tasks/task-display.types";

type TaskSubmissionModalProps = {
  task: { id: string; title: string; assigneeName: string; submission?: ApiTaskSubmission } | null;
  onClose: () => void;
};

/** What the assignee handed in for a task: their note and any PDFs. */
export function TaskSubmissionModal({ task, onClose }: TaskSubmissionModalProps) {
  const [pdfError, setPdfError] = useState<string | null>(null);
  useEffect(() => setPdfError(null), [task]);

  const openPdf = async (index: number) => {
    if (!task) return;
    setPdfError(null);
    try {
      await openAuthenticatedPdf(`/api/tasks/${task.id}/attachments/${index}`);
    } catch (err) {
      setPdfError(errorMessage(err, "Couldn't open this PDF."));
    }
  };

  const submission = task?.submission;

  return (
    <Modal isOpen={!!task} title={task ? `Submission: ${task.title}` : "Submission"} onClose={onClose} size="lg">
      {task && !submission && <p className="text-sm text-gray-400">Nothing was submitted for this task.</p>}
      {task && submission && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Submitted by {task.assigneeName} · {formatRelativeTime(submission.submittedAt)}
          </p>
          <p className="whitespace-pre-line rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">{submission.note}</p>
          {submission.attachments.length > 0 ? (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
              {submission.attachments.map((attachment, index) => (
                <li key={attachment.path}>
                  <button
                    type="button"
                    onClick={() => openPdf(index)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-red-500" />
                    <span className="truncate text-gray-700 hover:underline">{attachment.name}</span>
                    <span className="shrink-0 text-xs text-gray-400">{formatFileSize(attachment.size)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No files attached.</p>
          )}
          {pdfError && (
            <p role="alert" className="text-sm text-red-500">
              {pdfError}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
