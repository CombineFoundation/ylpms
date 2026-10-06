import { getInitials, type DisplayStatus } from "@/utils/user-status";
import { StatusBadge, TableMessageRow } from "@/components/Head-of-RO/shared/ListParts";
import { avatarColor } from "../dashboard/dashboard.types";
import { performanceColor } from "../assigned-ros/assigned-ro.types";

/** A youth leader as returned by GET /api/sro/youth-leaders. */
export type SroYouthLeader = {
  id: string;
  name: string;
  email?: string;
  region?: string;
  roId: string | null;
  roName: string;
  volunteers: number;
  openTasks: number;
  overdueTasks: number;
  performance: number | null;
  status: DisplayStatus;
};

type YouthLeaderTableProps = {
  leaders: SroYouthLeader[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
};

export function YouthLeaderTable({ leaders, isLoading, error, emptyMessage }: YouthLeaderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
            <th className="px-5 py-3">Name</th>
            <th className="px-4 py-3">Reporting Officer</th>
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Volunteers</th>
            <th className="px-4 py-3">Open Tasks</th>
            <th className="px-4 py-3">Performance</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading && <TableMessageRow colSpan={7} message="Loading youth leaders..." />}
          {!isLoading && error && <TableMessageRow colSpan={7} message={error} error />}

          {!isLoading &&
            !error &&
            leaders.map((leader) => (
              <tr key={leader.id} className="hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(leader.id)}`}
                    >
                      {getInitials(leader.name) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800">{leader.name}</p>
                      {leader.email && <p className="truncate text-xs text-gray-400">{leader.email}</p>}
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-4 font-medium ${leader.roId ? "text-brand-dark" : "text-gray-400"}`}>{leader.roName}</td>
                <td className="px-4 py-4 text-gray-600">{leader.region || "Unassigned"}</td>
                <td className="px-4 py-4 text-gray-600">{leader.volunteers}</td>
                <td className="px-4 py-4 text-gray-600">
                  {leader.openTasks}
                  {leader.overdueTasks > 0 && (
                    <span className="ml-1.5 text-xs text-red-500">({leader.overdueTasks} overdue)</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {leader.performance === null ? (
                    <span className="text-gray-400" title="Not rated yet">
                      —
                    </span>
                  ) : (
                    <span className={`font-semibold ${performanceColor(leader.performance)}`}>{leader.performance}%</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={leader.status} />
                </td>
              </tr>
            ))}

          {!isLoading && !error && leaders.length === 0 && <TableMessageRow colSpan={7} message={emptyMessage} />}
        </tbody>
      </table>
    </div>
  );
}
