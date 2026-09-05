"use client";

import React from "react";
import Sidebar from "@/components/SRO/Sidebar";
import { TopBar } from "@/components/SRO/TopBar";
import { TaskList } from "@/components/SRO/tasks/TaskList";
import { AssignedTasks } from "@/components/SRO/tasks/AssignedTasks";

export default function TasksPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 flex flex-col p-6 lg:p-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-800">Tasks</h1>
            <p className="text-sm text-gray-500">
              Tasks assigned by Head RO to you, and tasks you assign to your ROs.
            </p>
          </div>

          <TaskList />
          <AssignedTasks />
        </main>
      </div>
    </div>
  );
}