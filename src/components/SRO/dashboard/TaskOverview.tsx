"use client";

import { Clock, Loader, CheckCircle2, ChevronRight } from "lucide-react";

const taskOverview = [
  { label: "Pending", value: 2, icon: Clock, bg: "bg-orange-50", iconColor: "text-orange-400" },
  { label: "In Progress", value: 2, icon: Loader, bg: "bg-indigo-50", iconColor: "text-indigo-400" },
  { label: "Completed", value: 2, icon: CheckCircle2, bg: "bg-emerald-50", iconColor: "text-emerald-400" },
];

const upcomingTasks = [
  { title: "Submit monthly volunteer hours", meta: "Pedro Manalo · Aug 10, 2026" },
  { title: "Update youth leader profiles", meta: "Felipe Torres · Aug 15, 2026" },
];

export function TaskOverview() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Task Overview</h2>
        <button className="text-xs font-medium text-orange-500 flex items-center gap-0.5">
          View all <ChevronRight size={13} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {taskOverview.map((t) => (
          <div key={t.label} className={`rounded-xl ${t.bg} p-3 text-center`}>
            <t.icon size={16} className={`mx-auto ${t.iconColor}`} />
            <p className="mt-2 text-lg font-semibold text-slate-700">{t.value}</p>
            <p className="text-[11px] text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {upcomingTasks.map((task) => (
          <div key={task.title} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
            <div>
              <p className="text-sm text-slate-700 leading-tight">{task.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{task.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}