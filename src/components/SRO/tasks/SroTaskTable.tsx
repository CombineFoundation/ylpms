import { CalendarDays, Clock, FileCheck, Pencil, Trash2, Upload } from "lucide-react";
import type { TaskStatus } from "@/types/task.types";
import { TableMessageRow } from "@/components/Head-of-RO/shared/ListParts";
import {
  priorityLabels,
  priorityStyles,
  statusLabels,
  statusStyles,
} from "@/components/Head-of-RO/tasks/task-display.types";
import type { SroTaskRow } from "./sro-task.types";

type SroTaskTableProps = {
  /** "mine": tasks assigned to the SRO (progress only). "team": tasks the SRO assigned (full control). */
  mode: "mine" | "team";
  tasks: SroTaskRow[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  updatingId: string | null;
  onStatusChange: (task: SroTaskRow, status: TaskStatus) => void;
  onEdit?: (task: SroTaskRow) => void;
  onDelete?: (task: SroTaskRow) => void;
  /** "mine": hand in work for a task (note + PDFs), completing it. */
  onSubmit?: (task: SroTaskRow) => void;
  /** Either mode: see what the assignee handed in. */
  onViewSubmission?: (task: SroTaskRow) => void;
};

/** "Overdue" is derived from the due date, so it's never set directly. Assignees can't cancel. */
const SETTABLE_STATUSES: Record<SroTaskTableProps["mode"], TaskStatus[]> = {
  mine: ["assigned", "in-progress", "completed"],
  team: ["assigned", "in-progress", "completed", "cancelled"],
};

export function SroTaskTable({
  mode,
  tasks,
  isLoading,
  error,
  emptyMessage,
  updatingId,
  onStatusChange,
  onEdit,
  onDelete,
  onSubmit,
  onViewSubmission,
}: SroTaskTableProps) {
  const colSpan = 6;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
            <th className="px-5 py-3">Task</th>
            <th className="px-4 py-3">{mode === "team" ? "Assignee" : "Assigned by"}</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && <TableMessageRow colSpan={colSpan} message="Loading tasks..." />}
          {!isLoading && error && <TableMessageRow colSpan={colSpan} message={error} error />}

          {!isLoading &&
            !error &&
            tasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/60">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-900">{t.title}</p>
                  <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-gray-400">{t.description}</p>
                  {t.eventTitle && (
                    <span className="mt-1 inline-flex max-w-xs items-center gap-1 truncate rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-600">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      {t.eventTitle}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                  {mode === "team" ? t.assigneeName : t.assignerName}
                </td>
                <td className={`px-4 py-3.5 ${t.status === "overdue" ? "text-red-500" : "text-gray-500"}`}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="h-3.5 w-3.5" />
                    {t.dueDate}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[t.priority]}`}>
                    {priorityLabels[t.priority]}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <select
                    aria-label={`Status of "${t.title}"`}
                    value={t.status}
                    disabled={updatingId === t.id}
                    onChange={(event) => onStatusChange(t, event.target.value as TaskStatus)}
                    className={`rounded-full border-0 py-1 pl-3 pr-7 text-xs font-semibold disabled:opacity-50 ${statusStyles[t.status]}`}
                  >
                    {!SETTABLE_STATUSES[mode].includes(t.status) && <option value={t.status}>{statusLabels[t.status]}</option>}
                    {SETTABLE_STATUSES[mode].map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </td>
                {mode === "mine" && (
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {t.status !== "completed" && t.status !== "cancelled" && onSubmit && (
                        <button
                          type="button"
                          onClick={() => onSubmit(t)}
                          disabled={updatingId === t.id}
                          className="flex items-center gap-1 whitespace-nowrap rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                        >
                          <Upload className="h-3.5 w-3.5" /> Submit
                        </button>
                      )}
                      {t.submission && onViewSubmission && (
                        <button
                          type="button"
                          onClick={() => onViewSubmission(t)}
                          className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-gray-500 hover:text-brand"
                        >
                          <FileCheck className="h-3.5 w-3.5" /> My submission
                        </button>
                      )}
                    </div>
                  </td>
                )}
                {mode === "team" && (
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {t.submission && onViewSubmission && (
                        <button
                          type="button"
                          onClick={() => onViewSubmission(t)}
                          aria-label={`View submission for "${t.title}"`}
                          title="View submission"
                          className="text-emerald-500 hover:text-emerald-700"
                        >
                          <FileCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit?.(t)}
                        aria-label={`Edit "${t.title}"`}
                        title="Edit"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(t)}
                        aria-label={`Delete "${t.title}"`}
                        title="Delete"
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

          {!isLoading && !error && tasks.length === 0 && <TableMessageRow colSpan={colSpan} message={emptyMessage} />}
        </tbody>
      </table>
    </div>
  );
}
