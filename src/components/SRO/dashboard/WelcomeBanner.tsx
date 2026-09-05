"use client";

import { Plus, CalendarPlus } from "lucide-react";

export function WelcomeBanner() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Welcome back, Sarah! 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your assigned ROs, review reports, assign tasks, and track performance.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 hidden sm:block">Aug 5, 2026</span>
        <button className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
          <Plus size={15} />
          Assign Task
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <CalendarPlus size={15} />
          Create Event
        </button>
      </div>
    </div>
  );
}