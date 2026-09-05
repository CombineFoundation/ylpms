"use client";

import { Users, FileText, ListChecks } from "lucide-react";

const statCards = [
  {
    label: "ASSIGNED ROS",
    value: "5",
    sub: "+1 this month",
    icon: Users,
    accent: "bg-orange-100 text-orange-500",
  },
  {
    label: "YOUTH LEADERS",
    value: "30",
    sub: "Across all ROs",
    icon: Users,
    accent: "bg-rose-100 text-rose-400",
  },
  {
    label: "PENDING REPORTS",
    value: "2",
    sub: "Awaiting review",
    icon: FileText,
    accent: "bg-amber-100 text-amber-500",
  },
  {
    label: "ACTIVE TASKS",
    value: "4",
    sub: "In progress / pending",
    icon: ListChecks,
    accent: "bg-blue-100 text-blue-500",
  },
];

export function StatCards() {
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