"use client";

import {
  Users,
  ClipboardList,
  Calendar,
  Award,
} from "lucide-react";

const statCards = [
  {
    label: "My Volunteers",
    value: "8",
    icon: Users,
    color: "bg-blue-100 text-blue-500",
  },
  {
    label: "Assigned Tasks",
    value: "5",
    icon: ClipboardList,
    color: "bg-orange-100 text-orange-500",
  },
  {
    label: "Activities",
    value: "3",
    icon: Calendar,
    color: "bg-emerald-100 text-emerald-500",
  },
  {
    label: "Certificates Earned",
    value: "4",
    icon: Award,
    color: "bg-purple-100 text-purple-500",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}