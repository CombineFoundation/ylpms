"use client";

import { useMemo, useState } from "react";
import { usePagedList } from "@/hooks/usePagedList";
import { VolunteersTable } from "./VolunteersTable";
import { PageHeader, emptyMessage } from "../shared/ListParts";
import { UserToolbar } from "../shared/UserToolbar";
import { ManagerFilter } from "../shared/ManagerFilter";
import { UserDetailModal } from "../shared/UserDetailModal";
import { matchesQuery, regionOptions, toUserRow, type ApiUser, type StatusFilter, type UserRow } from "../shared/users";

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

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [regionFilter, setRegionFilter] = useState("");
  const [viewing, setViewing] = useState<UserRow | null>(null);

  const filtered = useMemo(
    () =>
      volunteers.filter(
        (volunteer) =>
          matchesQuery(volunteer, query) &&
          (statusFilter === "All" || volunteer.status === statusFilter) &&
          (!regionFilter || volunteer.regionLabel === regionFilter)
      ),
    [volunteers, query, statusFilter, regionFilter]
  );

  const isFiltered = !!query.trim() || statusFilter !== "All" || !!regionFilter || !!scope;

  return (
    <div className="space-y-6">
      <PageHeader title="Volunteers" description="All registered volunteers across regions." />

      <UserToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search volunteers by name, email, supervisor or city..."
        regionLabel="City"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        regions={regionOptions(volunteers)}
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
      />

      <UserDetailModal user={viewing} managerLabel="Reports to" onClose={() => setViewing(null)} />
    </div>
  );
}
