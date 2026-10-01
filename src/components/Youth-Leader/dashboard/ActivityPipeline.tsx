import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { YouthLeaderDashboardSummary } from "./dashboard.types";

/** How many of the youth leader's activities sit at each stage of the workflow. */
export function ActivityPipeline({ activities }: { activities: YouthLeaderDashboardSummary["pipeline"] }) {
  const stages = [
    { label: "Drafts", value: activities.drafts, style: "bg-gray-50 text-gray-700" },
    { label: "Needs changes", value: activities.needsChanges, style: "bg-red-50 text-red-600" },
    { label: "Awaiting approval", value: activities.awaitingApproval, style: "bg-amber-50 text-amber-700" },
    { label: "Approved / running", value: activities.upcoming, style: "bg-blue-50 text-blue-700" },
    { label: "Awaiting verification", value: activities.awaitingVerification, style: "bg-purple-50 text-purple-700" },
    { label: "Completed", value: activities.completed, style: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">My Activities</h2>
        <Link href="/youth-leader/activities" className="flex items-center gap-0.5 text-xs font-medium text-orange-500">
          Manage <ChevronRight size={13} />
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stages.map((stage) => (
          <div key={stage.label} className={`rounded-xl p-3 ${stage.style}`}>
            <p className="text-lg font-semibold">{stage.value}</p>
            <p className="text-[11px] opacity-80">{stage.label}</p>
          </div>
        ))}
      </div>
      {activities.needsChanges > 0 && (
        <p className="mt-3 text-xs text-red-600">
          {activities.needsChanges} activit{activities.needsChanges === 1 ? "y was" : "ies were"} sent back by your RO — edit and resubmit.
        </p>
      )}
    </div>
  );
}
