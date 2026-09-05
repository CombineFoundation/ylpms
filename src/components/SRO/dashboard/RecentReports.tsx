"use client";

import { ChevronRight } from "lucide-react";

const recentReports = [
  {
    title: "Q2 Youth Leader Progress Report",
    meta: "Pedro Manalo · Aug 1, 2026",
    status: "Pending",
    statusStyle: "bg-amber-100 text-amber-600",
    avatarBg: "bg-red-400",
    initials: "PM",
  },
  {
    title: "Community Outreach Summary",
    meta: "Rosa Bautista · Jul 28, 2026",
    status: "Under Review",
    statusStyle: "bg-purple-100 text-purple-600",
    avatarBg: "bg-orange-400",
    initials: "RB",
  },
  {
    title: "Volunteer Engagement Report",
    meta: "Felipe Torres · Jul 25, 2026",
    status: "Approved",
    statusStyle: "bg-emerald-100 text-emerald-600",
    avatarBg: "bg-blue-500",
    initials: "FT",
  },
  {
    title: "Monthly Activity Log",
    meta: "Gloria Mendoza · Jul 30, 2026",
    status: "Pending",
    statusStyle: "bg-amber-100 text-amber-600",
    avatarBg: "bg-emerald-500",
    initials: "GM",
  },
];

export function RecentReports() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Recent Reports</h2>
        <button className="text-xs font-medium text-orange-500 flex items-center gap-0.5">
          View all <ChevronRight size={13} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {recentReports.map((r) => (
          <div key={r.title} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${r.avatarBg}`}
            >
              {r.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate">{r.title}</p>
              <p className="text-xs text-slate-400">{r.meta}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${r.statusStyle}`}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}