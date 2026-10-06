"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, RotateCcw } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { formatFileSize, openAuthenticatedPdf } from "@/lib/report-attachments";
import { formatRelativeTime } from "@/utils/user-status";
import { Modal } from "@/components/ui/Modal";
import { inputClass } from "@/components/Head-of-RO/shared/ListParts";
import type { ApiTaskReview, ApiTaskSubmission } from "@/components/Head-of-RO/tasks/task-display.types";
import type { TaskStatus } from "@/types/task.types";

type TaskSubmissionModalProps = {
  task: {
    id: string;
    title: string;
    assigneeName: string;
    status: TaskStatus;
    submission?: ApiTaskSubmission;
    review?: ApiTaskReview;
  } | null;
  /** Set for the assigner: lets them accept the work or ask for changes while it's in review. */
  canReview?: boolean;
  onClose: () => void;
  /** Called after a review is saved, so the list can reload. */
  onReviewed?: () => void;
};

/** What the assignee handed in for a task (note and files), the reviewer's feedback, and review actions. */
export function TaskSubmissionModal({ task, canReview = false, onClose, onReviewed }: TaskSubmissionModalProps) {
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setPdfError(null);
    setIsRequestingChanges(false);
    setFeedback("");
    setReviewError(null);
  }, [task]);

  const openPdf = async (index: number) => {
    if (!task) return;
    setPdfError(null);
    try {
      await openAuthenticatedPdf(`/api/tasks/${task.id}/attachments/${index}`);
    } catch (err) {
      setPdfError(errorMessage(err, "Couldn't open this file."));
    }
  };

  const review = async (decision: "accept" | "request-changes") => {
    if (!task) return;
    const note = feedback.trim();
    if (decision === "request-changes" && note.length < 3) {
      setReviewError("Say what needs to change.");
      return;
    }
    setReviewError(null);
    setIsBusy(true);
    try {
      await apiFetch(`/api/tasks/${task.id}/review`, {
        method: "POST",
        body: note ? { decision, note } : { decision },
      });
      onReviewed?.();
    } catch (err) {
      setReviewError(errorMessage(err, "Unable to save your review."));
    } finally {
      setIsBusy(false);
    }
  };

  const submission = task?.submission;
  const showReviewActions = canReview && task?.status === "submitted";
  const lastReview = task?.review;

  return (
    <Modal
      isOpen={!!task}
      title={task ? `Submission: ${task.title}` : "Submission"}
      onClose={onClose}
      isBusy={isBusy}
      size="lg"
    >
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

          {lastReview && task.status !== "submitted" && <ReviewNote review={lastReview} />}
          {task.status === "submitted" && !canReview && (
            <p className="rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-700">
              Waiting for review. You&apos;ll be notified when it&apos;s accepted or if changes are needed.
            </p>
          )}

          {showReviewActions && (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              {isRequestingChanges && (
                <label className="block text-sm font-medium text-gray-700">
                  What needs to change?
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    maxLength={1000}
                    placeholder="Tell them what to fix or add before you can accept it..."
                    className={inputClass}
                    autoFocus
                  />
                </label>
              )}
              {reviewError && (
                <p role="alert" className="text-sm text-red-500">
                  {reviewError}
                </p>
              )}
              <div className="flex justify-end gap-3">
                {isRequestingChanges ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRequestingChanges(false)}
                      disabled={isBusy}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => review("request-changes")}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RotateCcw className="h-4 w-4" /> {isBusy ? "Sending..." : "Send back"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRequestingChanges(true)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 rounded-lg border border-orange-200 px-4 py-2 text-sm font-medium text-brand-dark hover:bg-orange-50"
                    >
                      <RotateCcw className="h-4 w-4" /> Ask for changes
                    </button>
                    <button
                      type="button"
                      onClick={() => review("accept")}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" /> {isBusy ? "Accepting..." : "Accept"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function ReviewNote({ review }: { review: ApiTaskReview }) {
  const accepted = review.decision === "accepted";
  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm ${accepted ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-brand-dark"}`}
    >
      <p className="font-semibold">
        {accepted ? "Accepted" : "Changes requested"} · {formatRelativeTime(review.reviewedAt)}
      </p>
      {review.note && <p className="mt-1 whitespace-pre-line">{review.note}</p>}
    </div>
  );
}
