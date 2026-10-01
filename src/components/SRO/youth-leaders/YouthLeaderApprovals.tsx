"use client";

import { useMemo, useState } from "react";
import { UserCheck } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { usePortalData } from "@/hooks/usePortalScope";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FilterPills, emptyMessage } from "@/components/Head-of-RO/shared/ListParts";
import type { ApiMemberRequest, MemberRequestRole, MemberRequestStatus } from "@/types/member-request.types";
import { ApprovalTable } from "./ApprovalTable";
import { memberIdSchema } from "@/utils/member-id";

/** Approved requests leave this section: they show up as members in the table below it. */
type StatusFilter = Exclude<MemberRequestStatus, "approved">;
type Decision = "approved" | "rejected";

/** Who approves which kind of request, and where their endpoints live. */
const APPROVALS: Record<
  MemberRequestRole,
  { portal: "sro" | "ro"; listPath: string; reviewPath: string; noun: string; requester: string }
> = {
  "youth-leader": {
    portal: "sro",
    listPath: "/api/sro/youth-leader-requests",
    reviewPath: "/api/youth-leader-requests",
    noun: "youth leader",
    requester: "RO",
  },
  volunteer: {
    portal: "ro",
    listPath: "/api/ro/volunteer-requests",
    reviewPath: "/api/volunteer-requests",
    noun: "volunteer",
    requester: "youth leader",
  },
};

/**
 * People your team asked to add (youth leaders from your ROs, or volunteers
 * from your youth leaders). Nothing is created until you approve; approving
 * creates the account under the requester and emails their sign-in details.
 */
export function MemberApprovals({ role, onApproved }: { role: MemberRequestRole; onApproved: () => void }) {
  const config = APPROVALS[role];
  const { data, setData, isLoading, error } = usePortalData<ApiMemberRequest[]>(
    config.portal,
    config.listPath,
    "Unable to load approval requests."
  );
  const requests = useMemo(() => (data ?? []).filter((r) => r.status !== "approved"), [data]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

  const [pending, setPending] = useState<{ request: ApiMemberRequest; decision: Decision } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    requests.forEach((r) => (byStatus[r.status] = (byStatus[r.status] || 0) + 1));
    return byStatus;
  }, [requests]);

  const filterOptions = [
    { value: "pending" as const, label: `Pending (${counts.pending || 0})` },
    { value: "rejected" as const, label: `Rejected (${counts.rejected || 0})` },
  ];

  const filtered = useMemo(
    () => requests.filter((r) => r.status === statusFilter),
    [requests, statusFilter]
  );

  const submitReview = async (comment: string, memberId: string) => {
    if (!pending) return;
    setIsBusy(true);
    setReviewError(null);
    try {
      const updated = await apiFetch<ApiMemberRequest>(`${config.reviewPath}/${pending.request.id}`, {
        method: "PATCH",
        body: { decision: pending.decision, comment: comment || undefined, memberId: memberId || undefined },
      });
      setData((current) => current && current.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      if (pending.decision === "approved") onApproved();
      setPending(null);
    } catch (err) {
      setReviewError(errorMessage(err, "Unable to update this request."));
    } finally {
      setIsBusy(false);
    }
  };

  const isReject = pending?.decision === "rejected";
  // Youth leader requests carry the ID the RO entered; a volunteer's ID is given here, on approval.
  const needsId = !isReject && !!pending && !pending.request.memberId;
  const pendingCount = counts.pending || 0;

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-gray-700">Approval requests</h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              {pendingCount} awaiting you
            </span>
          )}
        </div>
        <FilterPills label="Show" options={filterOptions} value={statusFilter} onChange={setStatusFilter} />
      </div>
      <p className="border-b border-gray-50 px-5 py-2.5 text-xs text-gray-400">
        {config.noun[0].toUpperCase() + config.noun.slice(1)}s your {config.requester}s want to add. No account is created until
        you approve.
      </p>

      <ApprovalTable
        noun={config.noun}
        requests={filtered}
        isLoading={isLoading}
        error={error}
        emptyMessage={emptyMessage({
          isFiltered: false,
          noun: statusFilter === "pending" ? "requests awaiting approval" : "rejected requests",
        })}
        busyId={isBusy ? pending?.request.id ?? null : null}
        onApprove={(request) => {
          setReviewError(null);
          setPending({ request, decision: "approved" });
        }}
        onReject={(request) => {
          setReviewError(null);
          setPending({ request, decision: "rejected" });
        }}
      />

      <ConfirmDialog
        isOpen={!!pending}
        title={isReject ? `Reject ${config.noun} request?` : `Approve ${config.noun}?`}
        message={
          <>
            <span className="font-medium text-gray-800">{pending?.request.name}</span> ({pending?.request.email}
            {pending?.request.memberId ? ` · ID ${pending.request.memberId}` : ""}), requested by {pending?.request.requestedByName}.{" "}
            {isReject
              ? `The ${config.requester} will see your reason. No account will be created.`
              : `Their account will be created under this ${config.requester} and sign-in details emailed to them.`}
          </>
        }
        confirmLabel={isReject ? "Reject" : "Approve & create account"}
        tone={isReject ? "danger" : "primary"}
        comment={
          isReject
            ? { label: "Reason for rejecting", placeholder: `Why can't this ${config.noun} be added?`, required: true, minLength: 3 }
            : { label: `Note to the ${config.requester} (optional)` }
        }
        field={
          needsId
            ? {
                label: `${config.noun[0].toUpperCase() + config.noun.slice(1)} ID`,
                placeholder: "e.g. CF-VOL-001",
                hint: "Required. Must be unique.",
                validate: (value) => {
                  const result = memberIdSchema.safeParse(value);
                  return result.success ? null : value ? result.error.issues[0].message : "Enter an ID";
                },
              }
            : undefined
        }
        isBusy={isBusy}
        error={reviewError}
        onConfirm={submitReview}
        onCancel={() => !isBusy && setPending(null)}
      />
    </section>
  );
}

/** The SRO's youth leader approvals. */
export function YouthLeaderApprovals({ onApproved }: { onApproved: () => void }) {
  return <MemberApprovals role="youth-leader" onApproved={onApproved} />;
}
