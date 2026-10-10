"use client";

import { useMemo, useState } from "react";
import { usePortalData } from "@/hooks/usePortalScope";
import { FilterPills, PageHeader, SearchInput, emptyMessage, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { STATUS_FILTER_OPTIONS, type StatusFilter } from "@/components/Head-of-RO/shared/users";
import { MemberApprovals } from "@/components/SRO/youth-leaders/YouthLeaderApprovals";
import { VolunteerTable, type TeamVolunteer } from "./VolunteerTable";
import { useTemporaryPassword } from "@/components/shared/useTemporaryPassword";

/**
 * Every volunteer under the RO (via their youth leaders), plus the volunteers
 * those youth leaders have asked to add, awaiting the RO's approval.
 */
export function VolunteerList() {
  const { data, isLoading, error, reload } = usePortalData<TeamVolunteer[]>("ro", "/api/ro/volunteers", "Unable to load volunteers.");
  const volunteers = useMemo(() => data ?? [], [data]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [leaderFilter, setLeaderFilter] = useState("");
  const temporaryPassword = useTemporaryPassword();

  const leaderOptions = useMemo(() => {
    const byId = new Map<string, string>();
    volunteers.forEach((v) => v.managerId && byId.set(v.managerId, v.managerName));
    return [...byId.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [volunteers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return volunteers.filter(
      (v) =>
        (statusFilter === "All" || v.status === statusFilter) &&
        (!leaderFilter || v.managerId === leaderFilter) &&
        (!q || [v.name, v.email ?? "", v.region ?? "", v.managerName].some((value) => value.toLowerCase().includes(q)))
    );
  }, [volunteers, search, statusFilter, leaderFilter]);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Volunteers"
        description={
          isLoading
            ? "Loading your team..."
            : `${volunteers.length} volunteer${volunteers.length === 1 ? "" : "s"} across your youth leaders.`
        }
      />

      <MemberApprovals role="volunteer" onApproved={reload} />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center">
          <div className="lg:w-80">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, youth leader or city..." />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
            Youth Leader:
            <select
              value={leaderFilter}
              onChange={(event) => setLeaderFilter(event.target.value)}
              className={`${inputClass} mt-0 w-auto py-1.5 text-sm`}
            >
              <option value="">All</option>
              {leaderOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <FilterPills label="Status" options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <VolunteerTable
          volunteers={filtered}
          isLoading={isLoading}
          error={error}
          onSetPassword={temporaryPassword.request}
          emptyMessage={emptyMessage({
            isFiltered: !!search.trim() || statusFilter !== "All" || !!leaderFilter,
            noun: "volunteers",
          })}
        />
      </div>

      {temporaryPassword.dialog}
    </div>
  );
}
