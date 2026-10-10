import { UserCog } from "lucide-react";
import { getInitials } from "@/utils/user-status";
import type { UserStatus } from "@/types/user.types";
import { LoadMoreButton, StatusBadge, TableMessageRow } from "../shared/ListParts";
import { UserRowActions } from "../shared/UserRowActions";
import type { UserRow } from "../shared/users";

type YouthLeadersTableProps = {
  leaders: UserRow[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onView: (leader: UserRow) => void;
  onAssignRo: (leader: UserRow) => void;
  onStatusChange: (leader: UserRow, status: UserStatus) => void;
  onSendReset: (leader: UserRow) => void;
  onSetPassword: (leader: UserRow) => void;
};

export function YouthLeadersTable({
  leaders,
  isLoading,
  error,
  emptyMessage,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onView,
  onAssignRo,
  onStatusChange,
  onSendReset,
  onSetPassword,
}: YouthLeadersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Reporting Officer</th>
              <th className="px-6 py-3.5">City</th>
              <th className="px-6 py-3.5">Volunteers</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Joined</th>
              <th className="px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <TableMessageRow colSpan={7} message="Loading youth leaders..." />}
            {!isLoading && error && <TableMessageRow colSpan={7} message={error} error />}
            {!isLoading &&
              !error &&
              leaders.map((leader) => (
                <tr key={leader.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <button type="button" onClick={() => onView(leader)} className="flex items-center gap-3 text-left">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                        {getInitials(leader.name)}
                      </span>
                      <span>
                        <span className="block font-medium text-gray-900 hover:text-brand">{leader.name}</span>
                        <span className="block text-xs text-gray-400">{leader.memberId ? `ID ${leader.memberId} · ` : ""}{leader.email}</span>
                      </span>
                    </button>
                  </td>
                  <td className={`px-6 py-4 font-medium ${leader.reportingToId ? "text-brand" : "text-gray-400"}`}>
                    {leader.reportingToName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{leader.regionLabel}</td>
                  <td className="px-6 py-4 text-gray-600">{leader.directReportCount}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={leader.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{leader.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onAssignRo(leader)}
                        className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-brand hover:text-brand-dark"
                      >
                        <UserCog className="h-4 w-4" />
                        {leader.reportingToId ? "Change RO" : "Assign RO"}
                      </button>
                      <UserRowActions user={leader} onStatusChange={onStatusChange} onSendReset={onSendReset} onSetPassword={onSetPassword} />
                    </div>
                  </td>
                </tr>
              ))}
            {!isLoading && !error && leaders.length === 0 && <TableMessageRow colSpan={7} message={emptyMessage} />}
          </tbody>
        </table>
      </div>
      {!isLoading && !error && (
        <LoadMoreButton hasMore={hasMore} isLoadingMore={isLoadingMore} onClick={onLoadMore} shownCount={leaders.length} />
      )}
    </div>
  );
}
