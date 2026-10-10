"use client";

import { useMemo, useState } from "react";
import { useLoadAllWhileSearching, usePagedList } from "@/hooks/usePagedList";
import { VolunteersTable } from "./VolunteersTable";
import { PageHeader, emptyMessage } from "../shared/ListParts";
import { UserToolbar } from "../shared/UserToolbar";
import { exportMembersCsv } from "../shared/exportMembers";
import { ManagerFilter } from "../shared/ManagerFilter";
import { UserDetailModal } from "../shared/UserDetailModal";
import { useUserAdminActions } from "../shared/useUserAdminActions";
import { matchesFilters, regionOptions, toUserRow, type ApiUser, type StatusFilter, type UserRow } from "../shared/users";

/** View-only directory of volunteers (Head RO can view, not edit, per the permissions spec). */
export function VolunteersList() {
  const [managerId, setManagerId] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const scope = unassignedOnly ? "&unassigned=true" : managerId ? `&reportingToId=${managerId}` : "";
  const list = usePagedList<ApiUser>(
    (page) => `/api/users?role=volunteer${scope}&pageSize=50&pageNumber=${page}`,
    `vol:${scope}`,
    "Unable to load volunteers."
  );
  const volunteers = useMemo(() => list.items.map(toUserRow), [list.items]);
  const admin = useUserAdminActions("volunteer", list.reload);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [regionFilter, setRegionFilter] = useState("");
  // Search and filters run on the client, so fetch the remaining pages while either is in use.
  useLoadAllWhileSearching(list, query, statusFilter !== "All" || !!regionFilter);
  const [viewing, setViewing] = useState<UserRow | null>(null);

  const filtered = useMemo(
    () => volunteers.filter((row) => matchesFilters(row, { query, statusFilter, regionFilter })),
    [volunteers, query, statusFilter, regionFilter]
  );

  const exportCsv = () =>
    exportMembersCsv({
      path: `/api/users?role=volunteer${scope}`,
      keep: (row) => matchesFilters(row, { query, statusFilter, regionFilter }),
      fileStem: "volunteers",
      regionLabel: "City",
      managerLabel: "Reports to",
    });

  const isFiltered = !!query.trim() || statusFilter !== "All" || !!regionFilter || !!scope;

  return (
    <div className="space-y-6">
      <PageHeader title="Volunteers" description="All registered volunteers across regions." />

      <UserToolbar
        onExport={exportCsv}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search volunteers by name, email, supervisor or city..."
        regionLabel="City"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        regions={regionOptions(volunteers, true)}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        unassignedOnly={{
          value: unassignedOnly,
          onChange: (value) => {
            setUnassignedOnly(value);
            if (value) setManagerId("");
          },
          label: "Without a supervisor only",
        }}
      />
      {!unassignedOnly && (
        <ManagerFilter label="Reports to" roles={["youth-leader", "ro"]} value={managerId} onChange={setManagerId} />
      )}

      <VolunteersTable
        volunteers={filtered}
        isLoading={list.isLoading}
        error={list.error}
        emptyMessage={emptyMessage({ isFiltered, noun: "volunteers" })}
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        onView={setViewing}
        onSendReset={admin.requestPasswordReset}
        onSetPassword={admin.requestSetPassword}
      />

      <UserDetailModal user={viewing} managerLabel="Reports to" onClose={() => setViewing(null)} />
      {admin.dialog}
    </div>
  );
}
