import type { UserStatus } from "@/types/user.types";
import { LoadMoreButton, TableMessageRow } from "../shared/ListParts";
import { RoTableRow } from "./RoTableRow";
import type { Ro } from "./ro.types";

type RoTableProps = {
  ros: Ro[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onEdit: (ro: Ro) => void;
  onDelete: (ro: Ro) => void;
  onStatusChange: (ro: Ro, status: UserStatus) => void;
  onSendReset: (ro: Ro) => void;
};

export function RoTable({
  ros,
  isLoading,
  error,
  emptyMessage,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onEdit,
  onDelete,
  onStatusChange,
  onSendReset,
}: RoTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">SRO</th>
              <th className="px-6 py-3.5">Region</th>
              <th className="px-6 py-3.5">Direct Reports</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading && <TableMessageRow colSpan={6} message="Loading Reporting Officers..." />}

            {!isLoading && error && <TableMessageRow colSpan={6} message={error} error />}

            {!isLoading &&
              !error &&
              ros.map((ro) => (
                <RoTableRow
                  key={ro.id}
                  ro={ro}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onSendReset={onSendReset}
                />
              ))}

            {!isLoading && !error && ros.length === 0 && <TableMessageRow colSpan={6} message={emptyMessage} />}
          </tbody>
        </table>
      </div>
      {!isLoading && !error && (
        <LoadMoreButton hasMore={hasMore} isLoadingMore={isLoadingMore} onClick={onLoadMore} shownCount={ros.length} />
      )}
    </div>
  );
}
