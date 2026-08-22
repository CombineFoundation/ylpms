"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  ChevronRight,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Flag,
} from "lucide-react";

type Priority = "High" | "Medium" | "Low";
type Status = "Pending" | "In Progress" | "Completed" | "Submitted" | "Overdue" | "Under Review";

type Task = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: Priority;
  status: Status;
  deadline: string;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Prepare Q3 program report",
    description: "Compile all branch data and submit a comprehensive Q3 progress report.",
    assignedTo: "Sara Malik",
    assignedBy: "Ahmad Karim",
    priority: "High",
    status: "In Progress",
    deadline: "Aug 18, 2025",
  },
  {
    id: "2",
    title: "Conduct volunteer orientation",
    description: "Organize and lead the new batch volunteer orientation session.",
    assignedTo: "Bilal Hussain",
    assignedBy: "Ahmad Karim",
    priority: "Medium",
    status: "Pending",
    deadline: "Aug 20, 2025",
  },
  {
    id: "3",
    title: "Submit activity attendance sheets",
    description: "Collect and digitize attendance sheets from the recent community event.",
    assignedTo: "Zainab Ali",
    assignedBy: "Bilal Hussain",
    priority: "High",
    status: "Submitted",
    deadline: "Aug 16, 2025",
  },
  {
    id: "4",
    title: "Update volunteer contact database",
    description: "Verify and update all volunteer contact information in the system.",
    assignedTo: "Sara Malik",
    assignedBy: "Ahmad Karim",
    priority: "Low",
    status: "Completed",
    deadline: "Aug 14, 2025",
  },
  {
    id: "5",
    title: "Review training materials",
    description: "Review newly uploaded training materials and provide feedback.",
    assignedTo: "Bilal Hussain",
    assignedBy: "Ahmad Karim",
    priority: "Medium",
    status: "Overdue",
    deadline: "Aug 12, 2025",
  },
  {
    id: "6",
    title: "Plan youth leadership summit agenda",
    description: "Draft a detailed agenda for the upcoming youth leadership summit.",
    assignedTo: "Zainab Ali",
    assignedBy: "Bilal Hussain",
    priority: "High",
    status: "In Progress",
    deadline: "Aug 25, 2025",
  },
  {
    id: "7",
    title: "Collect volunteer feedback forms",
    description: "Distribute and collect feedback forms from all active volunteers.",
    assignedTo: "Usman Raza",
    assignedBy: "Zainab Ali",
    priority: "Low",
    status: "Pending",
    deadline: "Aug 28, 2025",
  },
  {
    id: "8",
    title: "Branch monthly performance review",
    description: "Complete the monthly performance review for the Lahore branch.",
    assignedTo: "Sara Malik",
    assignedBy: "Ahmad Karim",
    priority: "Medium",
    status: "Under Review",
    deadline: "Aug 22, 2025",
  },
];

const priorityColors: Record<Priority, string> = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-blue-100 text-blue-600",
};

const priorityIcons: Record<Priority, React.ReactNode> = {
  High: <Flag size={14} className="text-red-500" />,
  Medium: <Flag size={14} className="text-amber-500" />,
  Low: <Flag size={14} className="text-blue-500" />,
};

const statusColors: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-600",
  "In Progress": "bg-blue-100 text-blue-600",
  Completed: "bg-emerald-100 text-emerald-600",
  Submitted: "bg-purple-100 text-purple-600",
  Overdue: "bg-red-100 text-red-500",
  "Under Review": "bg-indigo-100 text-indigo-600",
};

const statusIcons: Record<Status, React.ReactNode> = {
  Pending: <Clock size={14} className="text-amber-500" />,
  "In Progress": <AlertCircle size={14} className="text-blue-500" />,
  Completed: <CheckCircle size={14} className="text-emerald-500" />,
  Submitted: <CheckCircle size={14} className="text-purple-500" />,
  Overdue: <AlertCircle size={14} className="text-red-500" />,
  "Under Review": <Clock size={14} className="text-indigo-500" />,
};

export function TaskList() {
  const [tasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState("");

  const filtered = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      task.assignedBy.toLowerCase().includes(search.toLowerCase())
  );

  const totalTasks = filtered.length;
  const inProgress = filtered.filter((t) => t.status === "In Progress").length;
  const completed = filtered.filter((t) => t.status === "Completed").length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
        <p className="text-sm text-gray-500">
          Assign and track tasks across your team
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
              <ClipboardList size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
              <p className="text-xs text-gray-500">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-500">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-500">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8622C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d45520] transition-colors">
            <Plus size={16} />
            Assign Task
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search tasks or assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
            />
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
                  Assigned By
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Priority
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Deadline
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs">
                        {task.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{task.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {task.assignedBy}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {priorityIcons[task.priority]}
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {statusIcons[task.status]}
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColors[task.status]}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{task.deadline}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      aria-label={`View ${task.title}`}
                      className="flex items-center gap-1 text-sm font-medium text-[#E8622C] hover:text-[#d45520] transition-colors"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>1-{filtered.length} of {filtered.length}</span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}