"use client";

import { ChevronRight, Clock, Upload } from "lucide-react";
import { statusLabels, statusStyles } from "@/components/Head-of-RO/tasks/task-display.types";
import type { SroTaskRow } from "./sro-task.types";

const CAN_SUBMIT = ["assigned", "in-progress", "changes-requested", "overdue"];

type MyTaskCardsProps = {
  tasks: SroTaskRow[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  updatingId: string | null;
  onOpen: (task: SroTaskRow) => void;
  onSubmit: (task: SroTaskRow) => void;
  className?: string;
};

/** "Assigned to me" on phones: one card per task, with Submit in reach instead of off the side of a table. */
export function MyTaskCards({ tasks, isLoading, error, emptyMessage, updatingId, onOpen, onSubmit, className = "" }: MyTaskCardsProps) {
  if (isLoading) return <p className={`px-5 py-6 text-sm text-gray-400 ${className}`}>Loading tasks...</p>;
  if (error) return <p className={`px-5 py-6 text-sm text-red-500 ${className}`}>{error}</p>;
  if (tasks.length === 0) return <p className={`px-5 py-6 text-sm text-gray-500 ${className}`}>{emptyMessage}</p>;

  return (
    <ul className={`divide-y divide-gray-100 ${className}`}>
      {tasks.map((task) => (
        <li key={task.id} className="space-y-3 px-4 py-4">
          <button type="button" onClick={() => onOpen(task)} className="flex w-full items-start gap-2 text-left">
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-gray-900">{task.title}</span>
              <span className="mt-0.5 block text-xs text-gray-500">From {task.assignerName}</span>
              {task.status === "changes-requested" && task.review?.note && (
                <span className="mt-1 line-clamp-2 block text-xs text-brand-dark">
                  <span className="font-semibold">Changes requested:</span> {task.review.note}
                </span>
              )}
            </span>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" aria-hidden />
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[task.status]}`}>
              {statusLabels[task.status]}
            </span>
            <span className={`flex items-center gap-1 text-xs ${task.status === "overdue" ? "text-red-500" : "text-gray-500"}`}>
              <Clock className="h-3.5 w-3.5" /> Due {task.dueDate}
            </span>
            {CAN_SUBMIT.includes(task.status) && (
              <button
                type="button"
                onClick={() => onSubmit(task)}
                disabled={updatingId === task.id}
                className="ml-auto flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" /> {task.status === "changes-requested" ? "Resubmit" : "Submit"}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
