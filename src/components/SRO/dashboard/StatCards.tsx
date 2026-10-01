"use client";

import { Users, FileText, ListChecks } from "lucide-react";
import type { SRODashboardSummary } from "./dashboard.types";

export function StatCards({ stats }: { stats: SRODashboardSummary["stats"] }) {
  const statCards = [
    {
      label: "ASSIGNED ROS",
      value: stats.assignedROs,
      sub: "Reporting Officers in the team",
      icon: Users,
      accent: "bg-orange-100 text-orange-500",
    },
    {
      label: "YOUTH LEADERS",
      value: stats.youthLeaders,
      sub: `${stats.volunteers} volunteer${stats.volunteers === 1 ? "" : "s"} across all ROs`,
      icon: Users,
      accent: "bg-rose-100 text-rose-400",
    },
    {
      label: "PENDING REPORTS",
      value: stats.pendingReports,
      sub: "Awaiting review",
      icon: FileText,
      accent: "bg-amber-100 text-amber-500",
    },
    {
      label: "ACTIVE TASKS",
      value: stats.activeTasks,
      sub: stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : "None overdue",
      icon: ListChecks,
      accent: "bg-blue-100 text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
            <card.icon size={17} />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-wide text-slate-400">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{card.value}</p>
          <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
