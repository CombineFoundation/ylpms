"use client";

import { getInitials } from "@/utils/user-status";
import { avatarColor, type SRODashboardSummary } from "./dashboard.types";

function performanceColor(value: number) {
  if (value >= 80) return "#16a34a";
  if (value >= 60) return "#eab308";
  if (value >= 40) return "#f97316";
  return "#ef4444";
}

type RoPerformanceProps = {
  ros: SRODashboardSummary["roPerformance"];
  title?: string;
  emptyText?: string;
};

/** Performance bars for a manager's direct reports (ROs for an SRO, youth leaders for an RO). */
export function RoPerformance({
  ros,
  title = "Reporting Officer Performance",
  emptyText = "No ROs assigned yet.",
}: RoPerformanceProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">
        {ros.length === 0 && <p className="text-xs text-slate-400">{emptyText}</p>}
        {ros.map((ro) => (
          <div key={ro.id} className="flex items-center gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColor(ro.id)}`}
            >
              {getInitials(ro.name) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                <span className="truncate text-slate-600 font-medium">{ro.name}</span>
                <span className="shrink-0 text-slate-500 font-medium">
                  {ro.performance === null ? "—" : `${ro.performance}%`}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                {ro.performance !== null && (
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${ro.performance}%`, backgroundColor: performanceColor(ro.performance) }}
                  />
                )}
              </div>
              {(ro.region || ro.performance === null) && (
                <p className="mt-1 text-[11px] text-slate-400">{ro.performance === null ? "Not rated yet" : ro.region}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
