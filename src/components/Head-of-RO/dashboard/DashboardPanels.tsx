import Link from "next/link";
import { AlertTriangle, ClipboardList } from "lucide-react";
import type { DashboardSummary } from "./dashboard.types";
import { priorityLabels, priorityStyles } from "./dashboard.types";

type DashboardPanelsProps = {
  pendingReportCount: number;
  pendingReports: DashboardSummary["pendingReports"];
  overdueTaskCount: number;
  upcomingTasks: DashboardSummary["upcomingTasks"];
  reviewingReportId: string | null;
  onApproveReport: (report: { id: string; title: string }) => void;
  onRejectReport: (report: { id: string; title: string }) => void;
};

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-xs font-semibold text-brand hover:underline">
      {children}
    </Link>
  );
}

export function DashboardPanels({
  pendingReportCount,
  pendingReports,
  overdueTaskCount,
  upcomingTasks,
  reviewingReportId,
  onApproveReport,
  onRejectReport,
}: DashboardPanelsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-gray-900">
            Reports for Approval
            {pendingReportCount > 0 && <span className="ml-2 text-sm font-medium text-gray-400">({pendingReportCount})</span>}
          </h2>
          <PanelLink href="/Head-of-RO/reports">View all</PanelLink>
        </div>
        {pendingReports.length === 0 ? (
          <p className="text-sm text-gray-400">No reports awaiting approval.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{report.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {report.submittedByName} &middot; {report.submittedByRegion}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onApproveReport(report)}
                    disabled={reviewingReportId === report.id}
                    className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectReport(report)}
                    disabled={reviewingReportId === report.id}
                    className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingReportCount > pendingReports.length && (
              <p className="pt-4 text-xs text-gray-400">
                + {pendingReportCount - pendingReports.length} more — <PanelLink href="/Head-of-RO/reports">review all</PanelLink>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-gray-900">Upcoming Tasks</h2>
          <PanelLink href="/Head-of-RO/tasks">View all</PanelLink>
        </div>
        {overdueTaskCount > 0 && (
          <Link
            href="/Head-of-RO/tasks"
            className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            <AlertTriangle className="h-4 w-4" />
            {overdueTaskCount} task{overdueTaskCount === 1 ? " is" : "s are"} overdue
          </Link>
        )}
        {upcomingTasks.length === 0 ? (
          <p className="text-sm text-gray-400">No upcoming tasks.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                    <ClipboardList className="h-4 w-4 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{task.title}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      Due {task.dueDate} &middot; {task.assigneeName}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${priorityStyles[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
