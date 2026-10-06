"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { scopedPath, usePortalData, usePortalScope } from "@/hooks/usePortalScope";
import { ActionErrorBanner, PageHeader, SearchInput, emptyMessage } from "@/components/Head-of-RO/shared/ListParts";
import { toUserRow, type ApiUser } from "@/components/Head-of-RO/shared/users";
import type { ApiMemberRequest } from "@/types/member-request.types";
import { YouthLeaderTable } from "./YouthLeaderTable";
import { RequestList } from "./RequestList";
import { AddYouthLeaderModal } from "./AddYouthLeaderModal";
import type { AddYouthLeaderForm } from "./youth-leader.types";

/**
 * The RO's youth leaders. New youth leaders are requested here and only
 * created once the RO's SRO approves them.
 */
export function YouthLeaderList() {
  const { selectedId, ownerId } = usePortalScope("ro");
  const leaders = usePortalData<ApiUser[]>(
    "ro",
    `/api/users?role=youth-leader&reportingToId=${ownerId ?? ""}&pageSize=100`,
    "Unable to load youth leaders."
  );
  const requests = usePortalData<ApiMemberRequest[]>(
    "ro",
    "/api/ro/youth-leader-requests",
    "Unable to load your requests."
  );

  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const rows = useMemo(() => (leaders.data ?? []).map(toUserRow), [leaders.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.email, row.memberId, row.university, row.regionLabel, row.status].some((v) => v?.toLowerCase().includes(q))
    );
  }, [rows, search]);

  // Approved requests already show up as youth leaders.
  const openRequests = useMemo(
    () => (requests.data ?? []).filter((request) => request.status !== "approved"),
    [requests.data]
  );
  const pendingCount = openRequests.filter((request) => request.status === "pending").length;

  const handleAdd = async (values: AddYouthLeaderForm) => {
    setFormError(null);
    try {
      const created = await apiFetch<ApiMemberRequest>(scopedPath("/api/ro/youth-leader-requests", "ro", selectedId), {
        method: "POST",
        body: {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          region: values.region,
          university: values.university,
          memberId: values.memberId,
        },
      });
      requests.setData((current) => [created, ...(current ?? [])]);
      setIsAdding(false);
      setNotice(`Request to add ${values.name} was sent to your SRO for approval.`);
    } catch (error) {
      setFormError(errorMessage(error, "Unable to send this request."));
    }
  };

  const withdraw = async (request: ApiMemberRequest) => {
    setActionError(null);
    setWithdrawingId(request.id);
    try {
      await apiFetch(`/api/youth-leader-requests/${request.id}`, { method: "DELETE" });
      requests.setData((current) => current && current.filter((r) => r.id !== request.id));
    } catch (error) {
      setActionError(errorMessage(error, "Unable to withdraw this request."));
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Youth Leaders"
        description={
          pendingCount > 0
            ? `Manage youth leaders in your region · ${pendingCount} awaiting RO approval.`
            : "Manage youth leaders in your region."
        }
        actions={
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsAdding(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            <Plus size={15} />
            Add Youth Leader
          </button>
        }
      />

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-xs font-medium hover:underline">
            Dismiss
          </button>
        </div>
      )}
      <ActionErrorBanner message={actionError ?? requests.error} onDismiss={() => setActionError(null)} />

      <RequestList requests={openRequests} withdrawingId={withdrawingId} onWithdraw={withdraw} />

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:w-96">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, program ID or city..." />
        </div>
        <YouthLeaderTable
          leaders={filtered}
          isLoading={leaders.isLoading}
          error={leaders.error}
          emptyMessage={emptyMessage({
            isFiltered: !!search.trim(),
            noun: "youth leaders",
            emptyHint: "Use “Add Youth Leader” to request one.",
          })}
        />
      </section>

      <AddYouthLeaderModal askForId isOpen={isAdding} error={formError} onClose={() => setIsAdding(false)} onSubmit={handleAdd} />
    </div>
  );
}
