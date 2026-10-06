import type { MemberRequestStatus } from "@/types/member-request.types";

export const requestStatusLabels: Record<MemberRequestStatus, string> = {
  pending: "Awaiting for approval",
  approved: "Approved",
  rejected: "Rejected",
};

const requestStatusStyles: Record<MemberRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-600",
  approved: "bg-emerald-100 text-emerald-600",
  rejected: "bg-red-100 text-red-500",
};

/** Status pill for a youth leader request, shared by the RO and SRO portals. */
export function RequestStatusBadge({ status }: { status: MemberRequestStatus }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${requestStatusStyles[status]}`}>
      {requestStatusLabels[status]}
    </span>
  );
}
