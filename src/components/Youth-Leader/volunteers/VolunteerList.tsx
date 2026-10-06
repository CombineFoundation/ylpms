"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { scopedPath, usePortalData, usePortalScope } from "@/hooks/usePortalScope";
import { ActionErrorBanner, FilterPills, PageHeader, SearchInput, emptyMessage } from "@/components/Head-of-RO/shared/ListParts";
import { STATUS_FILTER_OPTIONS, type StatusFilter } from "@/components/Head-of-RO/shared/users";
import { VolunteerTable, type TeamVolunteer } from "@/components/RO/volunteers/VolunteerTable";
import { RequestList } from "@/components/RO/youth-leaders/RequestList";
import { AddYouthLeaderModal } from "@/components/RO/youth-leaders/AddYouthLeaderModal";
import type { AddYouthLeaderForm } from "@/components/RO/youth-leaders/youth-leader.types";
import type { ApiMemberRequest } from "@/types/member-request.types";

/**
 * The youth leader's volunteers. New volunteers are requested here and only
 * created once the youth leader's RO approves them.
 */
export function VolunteerList() {
  const { selectedId } = usePortalScope("youth-leader");
  const volunteers = usePortalData<TeamVolunteer[]>("youth-leader", "/api/youth-leader/volunteers", "Unable to load volunteers.");
  const requests = usePortalData<ApiMemberRequest[]>(
    "youth-leader",
    "/api/youth-leader/volunteer-requests",
    "Unable to load your requests."
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const rows = useMemo(() => volunteers.data ?? [], [volunteers.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (v) =>
        (statusFilter === "All" || v.status === statusFilter) &&
        (!q || [v.name, v.email ?? "", v.region ?? ""].some((value) => value.toLowerCase().includes(q)))
    );
  }, [rows, search, statusFilter]);

  // Approved requests already show up in the volunteer table.
  const openRequests = useMemo(() => (requests.data ?? []).filter((request) => request.status !== "approved"), [requests.data]);
  const pendingCount = openRequests.filter((request) => request.status === "pending").length;

  const handleAdd = async (values: AddYouthLeaderForm) => {
    setFormError(null);
    try {
      const created = await apiFetch<ApiMemberRequest>(scopedPath("/api/youth-leader/volunteer-requests", "youth-leader", selectedId), {
        method: "POST",
        body: {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          region: values.region,
          university: values.university,
          teamRole: values.teamRole,
        },
      });
      requests.setData((current) => [created, ...(current ?? [])]);
      setIsAdding(false);
      setNotice(`Request to add ${values.name} was sent to your RO for approval.`);
    } catch (error) {
      setFormError(errorMessage(error, "Unable to send this request."));
    }
  };

  const withdraw = async (request: ApiMemberRequest) => {
    setActionError(null);
    setWithdrawingId(request.id);
    try {
      await apiFetch(`/api/volunteer-requests/${request.id}`, { method: "DELETE" });
      requests.setData((current) => current && current.filter((r) => r.id !== request.id));
    } catch (error) {
      setActionError(errorMessage(error, "Unable to withdraw this request."));
    } finally {
      setWithdrawingId(null);
    }
  };

  const summary = volunteers.isLoading
    ? "Loading your team..."
    : `${rows.length} volunteer${rows.length === 1 ? "" : "s"} reporting to you${pendingCount > 0 ? ` · ${pendingCount} awaiting RO approval` : ""}.`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Volunteers"
        description={summary}
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
            Add Volunteer
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
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center">
          <div className="lg:w-80">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or city..." />
          </div>
          <FilterPills label="Status" options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        </div>
        <VolunteerTable
          volunteers={filtered}
          isLoading={volunteers.isLoading}
          error={volunteers.error}
          showManager={false}
          emptyMessage={emptyMessage({
            isFiltered: !!search.trim() || statusFilter !== "All",
            noun: "volunteers",
            emptyHint: "Use “Add Volunteer” to request one.",
          })}
        />
      </section>

      <AddYouthLeaderModal
        isOpen={isAdding}
        title="Add Volunteer"
        approver="RO"
        askForTeamRole
        error={formError}
        onClose={() => setIsAdding(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}
