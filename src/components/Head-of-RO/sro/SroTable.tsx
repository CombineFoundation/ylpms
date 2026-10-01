"use client";

import { getInitials } from "@/utils/user-status";
import type { UserStatus } from "@/types/user.types";
import { LoadMoreButton, StatusBadge, TableMessageRow } from "../shared/ListParts";
import { UserRowActions } from "../shared/UserRowActions";
import type { Sro } from "./sro.types";

type SroTableProps = {
  sros: Sro[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onEdit: (sro: Sro) => void;
  onDelete: (sro: Sro) => void;
  onStatusChange: (sro: Sro, status: UserStatus) => void;
  onManageROs: (sro: Sro) => void;
};

export function SroTable({
  sros,
  isLoading,
  error,
  emptyMessage,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onEdit,
  onDelete,
  onStatusChange,
  onManageROs,
}: SroTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Region</th>
              <th className="px-6 py-3.5">ROs Under</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Joined</th>
              <th className="px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <TableMessageRow colSpan={6} message="Loading SROs..." />}
            {!isLoading && error && <TableMessageRow colSpan={6} message={error} error />}
            {!isLoading &&
              !error &&
              sros.map((sro) => (
                <tr key={sro.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                        {getInitials(sro.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{sro.name}</p>
                        <p className="text-xs text-gray-400">{sro.memberId ? `ID ${sro.memberId} · ` : ""}{sro.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-brand">{sro.regionLabel}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <button
                      type="button"
                      onClick={() => onManageROs(sro)}
                      className="font-medium text-gray-700 underline-offset-2 hover:text-brand hover:underline"
                      title="View and manage ROs"
                    >
                      {sro.directReportCount}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={sro.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{sro.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onManageROs(sro)}
                        className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                      >
                        Manage ROs
                      </button>
                      <UserRowActions user={sro} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
                    </div>
                  </td>
                </tr>
              ))}
            {!isLoading && !error && sros.length === 0 && <TableMessageRow colSpan={6} message={emptyMessage} />}
          </tbody>
        </table>
      </div>
      {!isLoading && !error && (
        <LoadMoreButton hasMore={hasMore} isLoadingMore={isLoadingMore} onClick={onLoadMore} shownCount={sros.length} />
      )}
    </div>
  );
}
