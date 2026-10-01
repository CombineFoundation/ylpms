import { Clock } from "lucide-react";
import { RequestStatusBadge } from "@/components/shared/RequestStatusBadge";
import { formatRelativeTime } from "@/utils/user-status";
import type { ApiMemberRequest } from "@/types/member-request.types";

type RequestListProps = {
  requests: ApiMemberRequest[];
  withdrawingId: string | null;
  onWithdraw: (request: ApiMemberRequest) => void;
};

/** The RO's requests that are pending, or were rejected (approved ones appear in the youth leader table). */
export function RequestList({ requests, withdrawingId, onWithdraw }: RequestListProps) {
  if (requests.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-700">
        <Clock className="h-4 w-4 text-amber-500" />
        Your requests
        <span className="font-normal text-gray-400">({requests.length})</span>
      </h2>
      <ul className="divide-y divide-gray-50">
        {requests.map((request) => (
          <li key={request.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">
                {request.name}{" "}
                <span className="font-normal text-gray-400">
                  {request.memberId ? `· ID ${request.memberId} ` : ""}· {request.email}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Requested {formatRelativeTime(request.createdAt)}
                {request.status === "rejected" && (
                  <>
                    {" "}· Rejected by {request.reviewedByName}
                    {request.reviewComment && <span className="text-red-500"> — “{request.reviewComment}”</span>}
                  </>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <RequestStatusBadge status={request.status} />
              {request.status === "pending" && (
                <button
                  type="button"
                  onClick={() => onWithdraw(request)}
                  disabled={withdrawingId === request.id}
                  className="text-xs font-medium text-gray-500 hover:text-red-500 disabled:opacity-50"
                >
                  {withdrawingId === request.id ? "Withdrawing..." : "Withdraw"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
