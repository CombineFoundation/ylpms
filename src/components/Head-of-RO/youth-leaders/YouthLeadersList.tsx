"use client";

import { useMemo, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { useLoadAllWhileSearching, usePagedList } from "@/hooks/usePagedList";
import { YouthLeadersTable } from "./YouthLeadersTable";
import { AddYouthLeaderModal, type AddYouthLeaderForm } from "./AddYouthLeaderModal";
import { PageHeader, emptyMessage } from "../shared/ListParts";
import { UserToolbar } from "../shared/UserToolbar";
import { exportMembersCsv } from "../shared/exportMembers";
import { ManagerFilter } from "../shared/ManagerFilter";
import { UserDetailModal } from "../shared/UserDetailModal";
import { useUserAdminActions } from "../shared/useUserAdminActions";
import { AssignRoModal } from "./AssignRoModal";
import { matchesFilters, regionOptions, toUserRow, type ApiUser, type StatusFilter, type UserRow } from "../shared/users";

/**
 * Directory of Youth Leaders. Head RO can add one directly (an RO's additions
 * need SRO approval instead), give one a new RO, and suspend or reactivate them;
 * their details aren't edited here, per the permissions spec.
 */
export function YouthLeadersList() {
  const [managerId, setManagerId] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const scope = unassignedOnly ? "&unassigned=true" : managerId ? `&reportingToId=${managerId}` : "";
  const list = usePagedList<ApiUser>(
    (page) => `/api/users?role=youth-leader${scope}&pageSize=50&pageNumber=${page}`,
    `yl:${scope}`,
    "Unable to load Youth Leaders."
  );
  const leaders = useMemo(() => list.items.map(toUserRow), [list.items]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [regionFilter, setRegionFilter] = useState("");
  // Search and filters run on the client, so fetch the remaining pages while either is in use.
  useLoadAllWhileSearching(list, query, statusFilter !== "All" || !!regionFilter);
  const [viewing, setViewing] = useState<UserRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<UserRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const admin = useUserAdminActions("youth leader", list.reload);

  const handleAdd = async (values: AddYouthLeaderForm) => {
    setFormError(null);
    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: {
          email: values.email,
          memberId: values.memberId,
          name: values.name,
          region: values.region,
          university: values.university,
          role: "youth-leader",
          parentId: values.roId || undefined,
        },
      });
      setIsAdding(false);
      list.reload();
    } catch (error) {
      setFormError(errorMessage(error, "Unable to create youth leader."));
    }
  };

  const filtered = useMemo(
    () => leaders.filter((row) => matchesFilters(row, { query, statusFilter, regionFilter })),
    [leaders, query, statusFilter, regionFilter]
  );

  const exportCsv = () =>
    exportMembersCsv({
      path: `/api/users?role=youth-leader${scope}`,
      keep: (row) => matchesFilters(row, { query, statusFilter, regionFilter }),
      fileStem: "youth-leaders",
      regionLabel: "City",
      managerLabel: "RO",
      teamLabel: "Volunteers",
    });

  const isFiltered = !!query.trim() || statusFilter !== "All" || !!regionFilter || !!scope;

  return (
    <div className="space-y-6">
      <PageHeader title="Youth Leaders" description="Registered youth leaders under each RO." />

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-xs font-medium hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <UserToolbar
        onExport={exportCsv}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search youth leaders by name, email, RO or city..."
        regionLabel="City"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        regions={regionOptions(leaders, true)}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        unassignedOnly={{
          value: unassignedOnly,
          onChange: (value) => {
            setUnassignedOnly(value);
            if (value) setManagerId("");
          },
          label: "Without an RO only",
        }}
        addLabel="Add Youth Leader"
        onAdd={() => {
          setFormError(null);
          setIsAdding(true);
        }}
      />
      {!unassignedOnly && <ManagerFilter label="Reporting Officer" roles={["ro"]} value={managerId} onChange={setManagerId} />}

      <YouthLeadersTable
        leaders={filtered}
        isLoading={list.isLoading}
        error={list.error}
        emptyMessage={emptyMessage({ isFiltered, noun: "youth leaders" })}
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        onView={setViewing}
        onAssignRo={setAssigning}
        onStatusChange={admin.requestStatusChange}
        onSendReset={admin.requestPasswordReset}
        onSetPassword={admin.requestSetPassword}
      />

      <UserDetailModal user={viewing} managerLabel="Reporting Officer" reportsLabel="Volunteers" onClose={() => setViewing(null)} />
      <AddYouthLeaderModal isOpen={isAdding} error={formError} onClose={() => setIsAdding(false)} onSubmit={handleAdd} />
      <AssignRoModal
        leader={assigning}
        onClose={() => setAssigning(null)}
        onAssigned={(message) => {
          setAssigning(null);
          setNotice(message);
          list.reload();
        }}
      />
      {admin.dialog}
    </div>
  );
}
