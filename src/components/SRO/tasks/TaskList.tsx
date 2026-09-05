"use client";

import { useState } from "react";
import {
  Search,
  Calendar,
  User,
} from "lucide-react";

type Priority = "High" | "Medium" | "Low";

type Task = {
  id: string;
  title: string;
  assignee: string;
  assigneeInitials: string;
  assigneeColor: string;
  dueDate: string;
  priority: Priority;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Compile NCR region Q2 summary report",
    assignee: "Head RO",
    assigneeInitials: "HR",
    assigneeColor: "bg-purple-500",
    dueDate: "Aug 14, 2026",
    priority: "High",
  },
  {
    id: "2",
    title: "Verify all RO volunteer counts for audit",
    assignee: "Head RO",
    assigneeInitials: "HR",
    assigneeColor: "bg-purple-500",
    dueDate: "Aug 11, 2026",
    priority: "Medium",
  },
  {
    id: "3",
    title: "Attend national SRO coordination meeting",
    assignee: "Head RO",
    assigneeInitials: "HR",
    assigneeColor: "bg-purple-500",
    dueDate: "Aug 18, 2026",
    priority: "High",
  },
  {
    id: "4",
    title: "Submit mid-year performance evaluation",
    assignee: "Head RO",
    assigneeInitials: "HR",
    assigneeColor: "bg-purple-500",
    dueDate: "Jul 30, 2026",
    priority: "High",
  },
];

const priorityColors: Record<Priority, string> = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-blue-100 text-blue-600",
};

export function TaskList() {
  const [tasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState("");

  const filtered = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.assignee.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Assigned to Me by Head RO</h2>
            <p className="text-xs text-gray-400">{filtered.length} active</p>
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

      {/* Task cards - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
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
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-6 text-sm text-gray-400">
            No tasks assigned by Head RO
          </div>
        )}
      </div>
    </div>
  );
}