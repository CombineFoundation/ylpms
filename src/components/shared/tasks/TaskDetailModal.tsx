"use client";

import { CalendarDays, Clock, FileCheck, Undo2, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ReviewerFeedback } from "@/components/shared/PdfAttachmentPicker";
import { priorityLabels, priorityStyles, statusLabels, statusStyles } from "@/components/Head-of-RO/tasks/task-display.types";
import type { SroTaskRow } from "@/components/SRO/tasks/sro-task.types";

/** An assignee can't hand in work for these: it's with the reviewer, or finished. */
const LOCKED_FOR_ASSIGNEE = ["submitted", "completed", "cancelled"];

type TaskDetailModalProps = {
  task: SroTaskRow | null;
  /** "mine": the viewer is the assignee, so hand-in actions are offered. */
  mode: "mine" | "team" | "view";
  onClose: () => void;
  onSubmit?: (task: SroTaskRow) => void;
  onWithdraw?: (task: SroTaskRow) => void;
  onViewSubmission?: (task: SroTaskRow) => void;
};

/** Everything about one task — the full instructions the lists cut short — with the assignee's next step. */
export function TaskDetailModal({ task, mode, onClose, onSubmit, onWithdraw, onViewSubmission }: TaskDetailModalProps) {
  const act = (action?: (task: SroTaskRow) => void) => () => {
    if (!task || !action) return;
    onClose();
    action(task);
  };

  return (
    <Modal isOpen={!!task} title={task?.title ?? "Task"} onClose={onClose} size="lg">
      {task && (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>{statusLabels[task.status]}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]} priority
            </span>
            {task.isMonthly && (
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-dark">Monthly task</span>
            )}
          </div>

          {task.status === "changes-requested" && (
            <ReviewerFeedback title={`${task.assignerName} asked for changes`} message={task.review?.note} />
          )}

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-gray-500">{mode === "mine" ? "Assigned by" : "Assigned to"}</dt>
              <dd className="text-gray-800">{mode === "mine" ? task.assignerName : task.assigneeName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-500">Due</dt>
              <dd className={`flex items-center gap-1.5 ${task.status === "overdue" ? "text-red-600" : "text-gray-800"}`}>
                <Clock className="h-3.5 w-3.5" /> {task.dueDate}
              </dd>
            </div>
            {task.eventTitle && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-gray-500">For activity</dt>
                <dd className="flex items-center gap-1.5 text-gray-800">
                  <CalendarDays className="h-3.5 w-3.5 text-brand" /> {task.eventTitle}
                </dd>
              </div>
            )}
          </dl>

          <section>
            <h3 className="mb-1 text-xs font-semibold text-gray-500">What to do</h3>
            <p className="whitespace-pre-line text-gray-800">{task.description || "No details were added."}</p>
          </section>

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            {task.submission && onViewSubmission && (
              <button
                type="button"
                onClick={act(onViewSubmission)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <FileCheck className="h-4 w-4" /> {mode === "mine" ? "My submission" : "View submission"}
              </button>
            )}
            {mode === "mine" && task.status === "submitted" && onWithdraw && (
              <button
                type="button"
                onClick={act(onWithdraw)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Undo2 className="h-4 w-4" /> Withdraw
              </button>
            )}
            {mode === "mine" && !LOCKED_FOR_ASSIGNEE.includes(task.status) && onSubmit && (
              <button
                type="button"
                onClick={act(onSubmit)}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                <Upload className="h-4 w-4" /> {task.status === "changes-requested" ? "Resubmit" : "Submit work"}
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
