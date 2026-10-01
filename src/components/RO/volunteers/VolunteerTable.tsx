import { getInitials, type DisplayStatus } from "@/utils/user-status";
import { StatusBadge, TableMessageRow } from "@/components/Head-of-RO/shared/ListParts";
import { avatarColor } from "@/components/SRO/dashboard/dashboard.types";
import { performanceColor } from "@/components/SRO/assigned-ros/assigned-ro.types";
import type { UserRole } from "@/types/user.types";

/** A volunteer as returned by GET /api/ro/volunteers. */
export type TeamVolunteer = {
  id: string;
  name: string;
  email?: string;
  memberId?: string;
  region?: string;
  managerId: string | null;
  managerName: string;
  managerRole?: UserRole;
  openTasks: number;
  completedTasks: number;
  performance: number | null;
  status: DisplayStatus;
};

type VolunteerTableProps = {
  volunteers: TeamVolunteer[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  /** Hide the "Youth Leader" column when every volunteer reports to the viewer. */
  showManager?: boolean;
};

export function VolunteerTable({ volunteers, isLoading, error, emptyMessage, showManager = true }: VolunteerTableProps) {
  const colSpan = showManager ? 7 : 6;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
            <th className="px-5 py-3">Name</th>
            {showManager && <th className="px-4 py-3">Youth Leader</th>}
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Open Tasks</th>
            <th className="px-4 py-3">Completed</th>
            <th className="px-4 py-3">Performance</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading && <TableMessageRow colSpan={colSpan} message="Loading volunteers..." />}
          {!isLoading && error && <TableMessageRow colSpan={colSpan} message={error} error />}

          {!isLoading &&
            !error &&
            volunteers.map((volunteer) => (
              <tr key={volunteer.id} className="hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(volunteer.id)}`}
                    >
                      {getInitials(volunteer.name) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800">{volunteer.name}</p>
                      {(volunteer.memberId || volunteer.email) && (
                        <p className="truncate text-xs text-gray-400">
                          {volunteer.memberId ? `ID ${volunteer.memberId}${volunteer.email ? " · " : ""}` : ""}
                          {volunteer.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                {showManager && (
                  <td className="px-4 py-4">
                    <span className={`font-medium ${volunteer.managerId ? "text-orange-600" : "text-gray-400"}`}>
                      {volunteer.managerName}
                    </span>
                    {volunteer.managerRole === "ro" && <span className="ml-1 text-xs text-gray-400">(you)</span>}
                  </td>
                )}
                <td className="px-4 py-4 text-gray-600">{volunteer.region || "Unassigned"}</td>
                <td className="px-4 py-4 text-gray-600">{volunteer.openTasks}</td>
                <td className="px-4 py-4 text-gray-600">{volunteer.completedTasks}</td>
                <td className="px-4 py-4">
                  {volunteer.performance === null ? (
                    <span className="text-gray-400" title="Not rated yet">
                      —
                    </span>
                  ) : (
                    <span className={`font-semibold ${performanceColor(volunteer.performance)}`}>{volunteer.performance}%</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={volunteer.status} />
                </td>
              </tr>
            ))}

          {!isLoading && !error && volunteers.length === 0 && <TableMessageRow colSpan={colSpan} message={emptyMessage} />}
        </tbody>
      </table>
    </div>
  );
}
