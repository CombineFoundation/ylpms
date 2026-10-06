import { Pencil } from "lucide-react";
import { getInitials } from "@/utils/user-status";
import { StatusBadge, TableMessageRow } from "@/components/Head-of-RO/shared/ListParts";
import { avatarColor } from "../dashboard/dashboard.types";
import { performanceColor, type AssignedRO } from "./assigned-ro.types";

type AssignedROTableProps = {
  ros: AssignedRO[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  onAssignTask: (ro: AssignedRO) => void;
  onEdit: (ro: AssignedRO) => void;
};

export function AssignedROTable({ ros, isLoading, error, emptyMessage, onAssignTask, onEdit }: AssignedROTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
            <th className="px-5 py-3">Profile</th>
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Youth Leaders</th>
            <th className="px-4 py-3">Volunteers</th>
            <th className="px-4 py-3">Open Tasks</th>
            <th className="px-4 py-3">Reports</th>
            <th className="px-4 py-3">Performance</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading && <TableMessageRow colSpan={9} message="Loading assigned ROs..." />}
          {!isLoading && error && <TableMessageRow colSpan={9} message={error} error />}

          {!isLoading &&
            !error &&
            ros.map((ro) => (
              <tr key={ro.id} className="transition-colors hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(ro.id)}`}
                    >
                      {getInitials(ro.name) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-800">{ro.name}</p>
                      <p className="truncate text-xs text-gray-400">{ro.email || "Reporting Officer"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-600">{ro.region || "Unassigned"}</td>
                <td className="px-4 py-4 text-gray-600">{ro.youthLeaders}</td>
                <td className="px-4 py-4 text-gray-600">{ro.volunteers}</td>
                <td className="px-4 py-4 text-gray-600">
                  {ro.openTasks}
                  {ro.overdueTasks > 0 && <span className="ml-1.5 text-xs text-red-500">({ro.overdueTasks} overdue)</span>}
                </td>
                <td className="px-4 py-4 text-gray-600">{ro.reports}</td>
                <td className="px-4 py-4">
                  {ro.performance === null ? (
                    <span className="text-gray-400" title="Not rated yet">
                      —
                    </span>
                  ) : (
                    <span className={`font-semibold ${performanceColor(ro.performance)}`}>{ro.performance}%</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={ro.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onAssignTask(ro)}
                      className="whitespace-nowrap rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                      Assign Task
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(ro)}
                      aria-label={`Edit ${ro.name}`}
                      title="Edit"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

          {!isLoading && !error && ros.length === 0 && <TableMessageRow colSpan={9} message={emptyMessage} />}
        </tbody>
      </table>
    </div>
  );
}
