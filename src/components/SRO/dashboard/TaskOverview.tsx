"use client";

import Link from "next/link";
import { Clock, Loader, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import type { SRODashboardSummary } from "./dashboard.types";

type TaskOverviewProps = {
  overview: SRODashboardSummary["taskOverview"];
  upcomingTasks: SRODashboardSummary["upcomingTasks"];
  /** Portal route prefix, e.g. "/SRO" or "/RO". */
  basePath?: string;
};

export function TaskOverview({ overview, upcomingTasks, basePath = "/SRO" }: TaskOverviewProps) {
  const tiles = [
    { label: "Pending", value: overview.pending, icon: Clock, bg: "bg-orange-50", iconColor: "text-orange-400" },
    { label: "In Progress", value: overview.inProgress, icon: Loader, bg: "bg-indigo-50", iconColor: "text-indigo-400" },
    { label: "Completed", value: overview.completed, icon: CheckCircle2, bg: "bg-emerald-50", iconColor: "text-emerald-400" },
    { label: "Overdue", value: overview.overdue, icon: AlertTriangle, bg: "bg-red-50", iconColor: "text-red-400" },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Task Overview</h2>
        <Link href={`${basePath}/tasks`} className="text-xs font-medium text-orange-500 flex items-center gap-0.5">
          View all <ChevronRight size={13} />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className={`rounded-xl ${t.bg} p-3 text-center`}>
            <t.icon size={16} className={`mx-auto ${t.iconColor}`} />
            <p className="mt-2 text-lg font-semibold text-slate-700">{t.value}</p>
            <p className="text-[11px] text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {upcomingTasks.length === 0 && <p className="text-xs text-slate-400">No upcoming tasks.</p>}
        {upcomingTasks.map((task) => (
          <div key={task.id} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-700 leading-tight">{task.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {task.assigneeName} · due {task.dueDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
