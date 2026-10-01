"use client";

import { useMemo, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { usePagedList } from "@/hooks/usePagedList";
import { YouthLeadersTable } from "./YouthLeadersTable";
import { AddYouthLeaderModal, type AddYouthLeaderForm } from "./AddYouthLeaderModal";
import { PageHeader, emptyMessage } from "../shared/ListParts";
import { UserToolbar } from "../shared/UserToolbar";
import { ManagerFilter } from "../shared/ManagerFilter";
import { UserDetailModal } from "../shared/UserDetailModal";
import { matchesQuery, regionOptions, toUserRow, type ApiUser, type StatusFilter, type UserRow } from "../shared/users";

/**
 * Directory of Youth Leaders. Head RO can add one directly (an RO's additions
 * need SRO approval instead), but not edit existing ones, per the permissions spec.
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
  const [viewing, setViewing] = useState<UserRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    () =>
      leaders.filter(
        (leader) =>
          matchesQuery(leader, query) &&
          (statusFilter === "All" || leader.status === statusFilter) &&
          (!regionFilter || leader.regionLabel === regionFilter)
      ),
    [leaders, query, statusFilter, regionFilter]
  );

  const isFiltered = !!query.trim() || statusFilter !== "All" || !!regionFilter || !!scope;

  return (
    <div className="space-y-6">
      <PageHeader title="Youth Leaders" description="Registered youth leaders under each RO." />

      <UserToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search youth leaders by name, email, RO or city..."
        regionLabel="City"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        regions={regionOptions(leaders)}
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
      />

      <UserDetailModal user={viewing} managerLabel="Reporting Officer" reportsLabel="Volunteers" onClose={() => setViewing(null)} />
      <AddYouthLeaderModal isOpen={isAdding} error={formError} onClose={() => setIsAdding(false)} onSubmit={handleAdd} />
    </div>
  );
}
