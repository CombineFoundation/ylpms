import { ClipboardCheck, Clock, FileCheck, Pencil, Trash2 } from "lucide-react";
import type { TaskStatus } from "@/types/task.types";
import { LoadMoreButton, TableMessageRow } from "../shared/ListParts";
import { priorityLabels, priorityStyles, statusLabels, statusStyles, type TaskRow } from "./task-display.types";

interface TaskTableProps {
  tasks: TaskRow[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  updatingId: string | null;
  onLoadMore: () => void;
  onStatusChange: (task: TaskRow, status: TaskStatus) => void;
  onEdit: (task: TaskRow) => void;
  onDelete: (task: TaskRow) => void;
  onViewSubmission: (task: TaskRow) => void;
}

/**
 * Statuses a Head RO can set directly. "Overdue" is derived from the due date;
 * "In Review" / "Changes Requested" come from submitting and reviewing work.
 */
const SETTABLE_STATUSES: TaskStatus[] = ["assigned", "in-progress", "completed", "cancelled"];

/** Opens a submitted task's work so its reviewer can accept it or ask for changes. */
export function ReviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 whitespace-nowrap rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
    >
      <ClipboardCheck className="h-3.5 w-3.5" /> Review
    </button>
  );
}

export function TaskTable({
  tasks,
  isLoading,
  error,
  emptyMessage,
  hasMore,
  isLoadingMore,
  updatingId,
  onLoadMore,
  onStatusChange,
  onEdit,
  onDelete,
  onViewSubmission,
}: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <th className="px-6 py-3.5">Task</th>
              <th className="px-6 py-3.5">Assignee</th>
              <th className="px-6 py-3.5">Due Date</th>
              <th className="px-6 py-3.5">Priority</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <TableMessageRow colSpan={6} message="Loading tasks..." />}

            {!isLoading && error && <TableMessageRow colSpan={6} message={error} error />}

            {!isLoading &&
              !error &&
              tasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{t.title}</p>
                    <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-gray-400">{t.description}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{t.assigneeName}</td>
                  <td className={`px-6 py-4 ${t.status === "overdue" ? "text-red-500" : "text-gray-500"}`}>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5" />
                      {t.dueDate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[t.priority]}`}>
                      {priorityLabels[t.priority]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {t.isMonthly ? (
                      <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[t.status]}`}>
                        {statusLabels[t.status]}
                      </span>
                    ) : (
                    <select
                      aria-label={`Status of "${t.title}"`}
                      value={t.status}
                      disabled={updatingId === t.id}
                      onChange={(event) => onStatusChange(t, event.target.value as TaskStatus)}
                      className={`rounded-full border-0 py-1 pl-3 pr-7 text-xs font-semibold disabled:opacity-50 ${statusStyles[t.status]}`}
                    >
                      {!SETTABLE_STATUSES.includes(t.status) && <option value={t.status}>{statusLabels[t.status]}</option>}
                      {SETTABLE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {t.isMonthly ? (
                      <div className="flex items-center gap-3">
                        {t.submission && (
                          <button
                            type="button"
                            onClick={() => onViewSubmission(t)}
                            className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-gray-500 hover:text-brand"
                          >
                            <FileCheck className="h-3.5 w-3.5" /> View
                          </button>
                        )}
                        <span className="text-xs text-gray-400" title="The youth leader's RO manages and reviews monthly tasks">
                          Monthly · RO reviews
                        </span>
                      </div>
                    ) : (
                    <div className="flex items-center gap-3">
                      {t.status === "submitted" && <ReviewButton onClick={() => onViewSubmission(t)} />}
                      {t.submission && t.status !== "submitted" && (
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
                        onClick={() => onEdit(t)}
                        aria-label={`Edit "${t.title}"`}
                        title="Edit"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(t)}
                        aria-label={`Delete "${t.title}"`}
                        title="Delete"
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    )}
                  </td>
                </tr>
              ))}

            {!isLoading && !error && tasks.length === 0 && <TableMessageRow colSpan={6} message={emptyMessage} />}
          </tbody>
        </table>
      </div>
      {!isLoading && !error && (
        <LoadMoreButton hasMore={hasMore} isLoadingMore={isLoadingMore} onClick={onLoadMore} shownCount={tasks.length} />
      )}
    </div>
  );
}
