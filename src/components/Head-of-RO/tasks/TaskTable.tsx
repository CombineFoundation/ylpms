import { Clock, Check, Pencil, Trash2 } from "lucide-react";

type Priority = "High" | "Medium" | "Low";
type Status = "Pending" | "In Progress" | "Done";

type Task = {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  priority: Priority;
  status: Status;
};

const priorityStyles: Record<Priority, string> = {
  High: "bg-red-100 text-red-500",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-gray-100 text-gray-400",
};

const statusStyles: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-600",
  "In Progress": "bg-blue-100 text-blue-600",
  Done: "bg-emerald-100 text-emerald-600",
};

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
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
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/60">
                <td className="px-6 py-4 font-medium text-gray-900">{t.task}</td>
                <td className="px-6 py-4 text-gray-600">{t.assignee}</td>
                <td className="px-6 py-4 text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {t.dueDate}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[t.status]}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Mark "${t.task}" complete`}
                      className="text-gray-400 hover:text-emerald-500"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit "${t.task}"`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete "${t.task}"`}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-gray-400"
                >
                  No tasks match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}