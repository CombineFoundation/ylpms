import { getInitials } from "@/utils/user-status";
import { LoadMoreButton, StatusBadge, TableMessageRow } from "../shared/ListParts";
import type { UserRow } from "../shared/users";

type VolunteersTableProps = {
  volunteers: UserRow[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onView: (volunteer: UserRow) => void;
};

export function VolunteersTable({
  volunteers,
  isLoading,
  error,
  emptyMessage,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onView,
}: VolunteersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Reports To</th>
              <th className="px-6 py-3.5">City</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <TableMessageRow colSpan={5} message="Loading volunteers..." />}
            {!isLoading && error && <TableMessageRow colSpan={5} message={error} error />}
            {!isLoading &&
              !error &&
              volunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <button type="button" onClick={() => onView(volunteer)} className="flex items-center gap-3 text-left">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                        {getInitials(volunteer.name)}
                      </span>
                      <span>
                        <span className="block font-medium text-gray-900 hover:text-brand">{volunteer.name}</span>
                        <span className="block text-xs text-gray-400">{volunteer.memberId ? `ID ${volunteer.memberId} · ` : ""}{volunteer.email}</span>
                      </span>
                    </button>
                  </td>
                  <td className={`px-6 py-4 font-medium ${volunteer.reportingToId ? "text-brand" : "text-gray-400"}`}>
                    {volunteer.reportingToName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{volunteer.regionLabel}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={volunteer.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{volunteer.joined}</td>
                </tr>
              ))}
            {!isLoading && !error && volunteers.length === 0 && <TableMessageRow colSpan={5} message={emptyMessage} />}
          </tbody>
        </table>
      </div>
      {!isLoading && !error && (
        <LoadMoreButton hasMore={hasMore} isLoadingMore={isLoadingMore} onClick={onLoadMore} shownCount={volunteers.length} />
      )}
    </div>
  );
}
