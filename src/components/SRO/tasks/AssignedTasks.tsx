"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  Users,
} from "lucide-react";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type Priority = "High" | "Medium" | "Low";

type Task = {
  id: string;
  title: string;
  assignee: string;
  assigneeInitials: string;
  assigneeColor: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Submit monthly volunteer hours",
    assignee: "Pedro Manalo",
    assigneeInitials: "PM",
    assigneeColor: "bg-red-400",
    dueDate: "Aug 10",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "2",
    title: "Prepare Q2 performance report",
    assignee: "Gloria Mendoza",
    assigneeInitials: "GM",
    assigneeColor: "bg-emerald-500",
    dueDate: "Aug 5",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "3",
    title: "Update youth leader profiles",
    assignee: "Felipe Torres",
    assigneeInitials: "FT",
    assigneeColor: "bg-blue-500",
    dueDate: "Aug 15",
    priority: "Low",
    status: "Pending",
  },
  {
    id: "4",
    title: "Review volunteer applications",
    assignee: "Pedro Manalo",
    assigneeInitials: "PM",
    assigneeColor: "bg-red-400",
    dueDate: "Aug 8",
    priority: "High",
    status: "Completed",
  },
];

const priorityColors: Record<Priority, string> = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-blue-100 text-blue-600",
};

const statusColors: Record<TaskStatus, string> = {
  Pending: "bg-amber-50 border-amber-200",
  "In Progress": "bg-blue-50 border-blue-200",
  Completed: "bg-emerald-50 border-emerald-200",
};

const statusHeaderColors: Record<TaskStatus, string> = {
  Pending: "text-amber-700",
  "In Progress": "text-blue-700",
  Completed: "text-emerald-700",
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  Pending: <Clock size={18} className="text-amber-500" />,
  "In Progress": <AlertCircle size={18} className="text-blue-500" />,
  Completed: <CheckCircle size={18} className="text-emerald-500" />,
};

const statusBadgeColors: Record<TaskStatus, string> = {
  Pending: "bg-amber-500",
  "In Progress": "bg-blue-500",
  Completed: "bg-emerald-500",
};

export function AssignedTasks() {
  const [tasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState("");

  const filtered = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.assignee.toLowerCase().includes(search.toLowerCase())
  );

  const pendingTasks = filtered.filter((t) => t.status === "Pending");
  const inProgressTasks = filtered.filter((t) => t.status === "In Progress");
  const completedTasks = filtered.filter((t) => t.status === "Completed");

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        <div className="h-2 w-2 rounded-full bg-gray-300" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {task.title}
          </h3>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1.5">
          <div className="flex items-center gap-1.5">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-semibold text-white ${task.assigneeColor}`}
            >
              {task.assigneeInitials}
            </div>
            <span className="text-xs text-gray-500">{task.assignee}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
      
      <button className="flex-shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
        View
      </button>
    </div>
  );

  const TaskColumn = ({ 
    title, 
    tasks, 
    icon 
  }: { 
    title: string; 
    tasks: Task[]; 
    icon: React.ReactNode;
  }) => (
    <div className="flex-1 min-w-[280px]">
      <div className={`rounded-xl border ${statusColors[title as TaskStatus]} p-4 h-full`}>
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className={`text-sm font-semibold ${statusHeaderColors[title as TaskStatus]}`}>
            {title}
          </h2>
          <span className={`ml-auto rounded-full ${statusBadgeColors[title as TaskStatus]} px-2.5 py-0.5 text-xs font-semibold text-white`}>
            {tasks.length}
          </span>
        </div>
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="text-center py-6 text-xs text-gray-400">
              No {title.toLowerCase()} tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Section header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Tasks I Assigned to My ROs</h2>
            <p className="text-xs text-gray-400">{filtered.length} total</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={15} />
              Filter
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-orange-500 px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              <Plus size={15} />
              Assign Task
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative w-64 mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
        />
      </div>

      {/* Task Columns - 3 columns */}
      <div className="flex flex-col lg:flex-row gap-5">
        <TaskColumn
          title="Pending"
          tasks={pendingTasks}
          icon={<Clock size={18} className="text-amber-500" />}
        />
        <TaskColumn
          title="In Progress"
          tasks={inProgressTasks}
          icon={<AlertCircle size={18} className="text-blue-500" />}
        />
        <TaskColumn
          title="Completed"
          tasks={completedTasks}
          icon={<CheckCircle size={18} className="text-emerald-500" />}
        />
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={16} className="text-gray-400" />
          <span className="font-medium">Sarah Johnson</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">Senior RO</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Showing {filtered.length} tasks</span>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}