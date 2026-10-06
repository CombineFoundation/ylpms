"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getInitials } from "@/utils/user-status";
import { avatarColor, type ReportStatus, type SRODashboardSummary } from "./dashboard.types";

const STATUS_STYLES: Record<ReportStatus, { label: string; style: string }> = {
  draft: { label: "Draft", style: "bg-slate-100 text-slate-500" },
  submitted: { label: "Pending", style: "bg-amber-100 text-amber-600" },
  reviewed: { label: "Under Review", style: "bg-purple-100 text-purple-600" },
  approved: { label: "Approved", style: "bg-emerald-100 text-emerald-600" },
  rejected: { label: "Rejected", style: "bg-red-100 text-red-600" },
};


type RecentReportsProps = {
  reports: SRODashboardSummary["recentReports"];
  basePath?: string;
  title?: string;
  emptyText?: string;
};

export function RecentReports({
  reports,
  basePath = "/SRO",
  title = "Recent Reports",
  emptyText = "No reports submitted yet.",
}: RecentReportsProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <Link href={`${basePath}/reports`} className="text-xs font-medium text-brand flex items-center gap-0.5">
          View all <ChevronRight size={13} />
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {reports.length === 0 && <p className="text-xs text-slate-400">{emptyText}</p>}
        {reports.map((r) => {
          const status = STATUS_STYLES[r.status] ?? STATUS_STYLES.submitted;
          return (
            <div key={r.id} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColor(r.submittedByName)}`}
              >
                {getInitials(r.submittedByName) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">{r.title}</p>
                <p className="text-xs text-slate-400">
                  {r.submittedByName} · {r.date}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.style}`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
