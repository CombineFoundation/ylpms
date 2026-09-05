"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

type Priority = "High" | "Medium" | "Low";
type Status = "Pending" | "In Progress" | "Done";

type Task = {
  id: string;
  title: string;
  assignedTo: string;
  assignedToInitials: string;
  assignedToColor: string;
  dueDate: string;
  priority: Priority;
  status: Status;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Update volunteer profile database",
    assignedTo: "Sitti Amina",
    assignedToInitials: "SA",
    assignedToColor: "bg-pink-500",
    dueDate: "Sep 15, 2026",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: "2",
    title: "Prepare logistics for Disaster Drill",
    assignedTo: "Dave Bautista",
    assignedToInitials: "DB",
    assignedToColor: "bg-emerald-500",
    dueDate: "Sep 12, 2026",
    priority: "High",
    status: "Pending",
  },
  {
    id: "3",
    title: "Conduct Youth Leader orientation",
    assignedTo: "All Leaders",
    assignedToInitials: "AL",
    assignedToColor: "bg-purple-500",
    dueDate: "Sep 20, 2026",
    priority: "High",
    status: "Pending",
  },
  {
    id: "4",
    title: "Submit monthly regional status",
    assignedTo: "Self (RO)",
    assignedToInitials: "SR",
    assignedToColor: "bg-blue-500",
    dueDate: "Aug 31, 2026",
    priority: "Low",
    status: "Done",
  },
  {
    id: "5",
    title: "Distribute Relief Operation guidelines",
    assignedTo: "John Mark Reyes",
    assignedToInitials: "JMR",
    assignedToColor: "bg-orange-500",
    dueDate: "Sep 18, 2026",
    priority: "Medium",
    status: "In Progress",
  },
];

const priorityColors: Record<Priority, string> = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-blue-100 text-blue-600",
};

const statusStyles: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-600",
  "In Progress": "bg-blue-100 text-blue-600",
  Done: "bg-emerald-100 text-emerald-600",
};

const statusIcons: Record<Status, React.ReactNode> = {
  Pending: <Clock size={14} className="text-amber-500" />,
  "In Progress": <AlertCircle size={14} className="text-blue-500" />,
  Done: <CheckCircle size={14} className="text-emerald-500" />,
};

export function TaskList() {
  const [tasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState("");

  const filtered = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Tasks</h1>
        <p className="text-sm text-gray-500">
          Your assigned and created tasks.
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search + Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={15} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Task
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Assigned To
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Due Date
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Priority
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-gray-800">
                      {task.title}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ${task.assignedToColor}`}
                      >
                        {task.assignedToInitials}
                      </div>
                      <span className="text-sm text-gray-600">{task.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{task.dueDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityColors[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {statusIcons[task.status]}
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`View ${task.title}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${task.title}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${task.title}`}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
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

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Total Tasks:</span>
            <span className="text-gray-900 font-semibold">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              <Plus size={15} />
              Create Task
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>1-{filtered.length} of {filtered.length}</span>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}