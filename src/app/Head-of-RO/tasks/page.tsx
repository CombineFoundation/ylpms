"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { TaskHeader } from "@/components/Head-of-RO/tasks/TaskHeader";
import { TaskToolbar } from "@/components/Head-of-RO/tasks/TaskToolbar";
import { TaskTable } from "@/components/Head-of-RO/tasks/TaskTable";

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

const initialTasks: Task[] = [
  {
    id: "1",
    task: "Review Q2 volunteer reports",
    assignee: "All SROs",
    dueDate: "Aug 10, 2026",
    priority: "High",
    status: "Pending",
  },
  {
    id: "2",
    task: "Onboard 3 new ROs in NCR",
    assignee: "Maria Santos",
    dueDate: "Aug 15, 2026",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: "3",
    task: "Conduct youth leader training",
    assignee: "Jose Reyes",
    dueDate: "Aug 20, 2026",
    priority: "High",
    status: "Pending",
  },
  {
    id: "4",
    task: "Update volunteer database",
    assignee: "All ROs",
    dueDate: "Jul 31, 2026",
    priority: "Low",
    status: "Done",
  },
  {
    id: "5",
    task: "Submit region analytics report",
    assignee: "Ana Cruz",
    dueDate: "Aug 5, 2026",
    priority: "High",
    status: "In Progress",
  },
];

export default function TasksPage() {
  const [tasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.task.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
    );
  }, [tasks, query]);

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <TaskHeader />
          <TaskToolbar searchQuery={query} onSearchChange={setQuery} />
          <TaskTable tasks={filtered} />
        </main>
      </div>
    </div>
  );
}