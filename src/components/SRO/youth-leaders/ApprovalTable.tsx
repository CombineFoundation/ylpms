import { TableMessageRow } from "@/components/Head-of-RO/shared/ListParts";
import { RequestStatusBadge } from "@/components/shared/RequestStatusBadge";
import { formatRelativeTime } from "@/utils/user-status";
import type { ApiMemberRequest } from "@/types/member-request.types";

type ApprovalTableProps = {
  /** e.g. "youth leader" or "volunteer". */
  noun?: string;
  requests: ApiMemberRequest[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  busyId: string | null;
  onApprove: (request: ApiMemberRequest) => void;
  onReject: (request: ApiMemberRequest) => void;
};

export function ApprovalTable({
  noun = "youth leader",
  requests,
  isLoading,
  error,
  emptyMessage,
  busyId,
  onApprove,
  onReject,
}: ApprovalTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
            <th className="px-5 py-3 capitalize">Proposed {noun}</th>
            <th className="px-4 py-3">Requested by</th>
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Requested</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading && <TableMessageRow colSpan={6} message="Loading requests..." />}
          {!isLoading && error && <TableMessageRow colSpan={6} message={error} error />}

          {!isLoading &&
            !error &&
            requests.map((request) => (
              <tr key={request.id} className="align-top hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{request.name}</p>
                  <p className="text-xs text-gray-400">
                    {request.memberId ? `ID ${request.memberId} · ` : ""}
                    {request.email}
                    {request.phone ? ` · ${request.phone}` : ""}
                  </p>
                </td>
                <td className="px-4 py-4 font-medium text-orange-600">{request.requestedByName}</td>
                <td className="px-4 py-4 text-gray-600">{request.region || "—"}</td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-500">{formatRelativeTime(request.createdAt)}</td>
                <td className="px-4 py-4">
                  <RequestStatusBadge status={request.status} />
                  {request.status !== "pending" && (
                    <p className="mt-1 max-w-xs text-xs text-gray-400">
                      by {request.reviewedByName}
                      {request.reviewComment ? ` — “${request.reviewComment}”` : ""}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  {request.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onApprove(request)}
                        disabled={busyId === request.id}
                        className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(request)}
                        disabled={busyId === request.id}
                        className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No actions</span>
                  )}
                </td>
              </tr>
            ))}

          {!isLoading && !error && requests.length === 0 && <TableMessageRow colSpan={6} message={emptyMessage} />}
        </tbody>
      </table>
    </div>
  );
}
