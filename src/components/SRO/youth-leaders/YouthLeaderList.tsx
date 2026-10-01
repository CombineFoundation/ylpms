"use client";

import { useMemo, useState } from "react";
import { useSroData } from "@/hooks/usePortalScope";
import { FilterPills, PageHeader, SearchInput, emptyMessage, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { STATUS_FILTER_OPTIONS, type StatusFilter } from "@/components/Head-of-RO/shared/users";
import { YouthLeaderTable, type SroYouthLeader } from "./YouthLeaderTable";
import { YouthLeaderApprovals } from "./YouthLeaderApprovals";

/** Youth leaders under the SRO's ROs, plus the ROs' requests to add new ones. */
export function YouthLeaderList() {
  const { data, isLoading, error: loadError, reload } = useSroData<SroYouthLeader[]>(
    "/api/sro/youth-leaders",
    "Unable to load youth leaders."
  );
  const leaders = useMemo(() => data ?? [], [data]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [roFilter, setRoFilter] = useState("");

  const roOptions = useMemo(() => {
    const byId = new Map<string, string>();
    leaders.forEach((leader) => leader.roId && byId.set(leader.roId, leader.roName));
    return [...byId.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [leaders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leaders.filter(
      (leader) =>
        (statusFilter === "All" || leader.status === statusFilter) &&
        (!roFilter || leader.roId === roFilter) &&
        (!q || [leader.name, leader.email ?? "", leader.region ?? "", leader.roName].some((v) => v.toLowerCase().includes(q)))
    );
  }, [leaders, search, statusFilter, roFilter]);

  const totalVolunteers = leaders.reduce((sum, leader) => sum + leader.volunteers, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Youth Leaders"
        description={
          isLoading
            ? "Loading your team..."
            : `${leaders.length} youth leader${leaders.length === 1 ? "" : "s"} managing ${totalVolunteers} volunteer${totalVolunteers === 1 ? "" : "s"} across your ROs.`
        }
      />

      <YouthLeaderApprovals onApproved={reload} />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center">
          <div className="lg:w-80">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, RO or region..." />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
            RO:
            <select
              value={roFilter}
              onChange={(event) => setRoFilter(event.target.value)}
              className={`${inputClass} mt-0 w-auto py-1.5 text-sm`}
            >
              <option value="">All ROs</option>
              {roOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <FilterPills label="Status" options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <YouthLeaderTable
          leaders={filtered}
          isLoading={isLoading}
          error={loadError}
          emptyMessage={emptyMessage({
            isFiltered: !!search.trim() || statusFilter !== "All" || !!roFilter,
            noun: "youth leaders",
          })}
        />
      </div>
    </div>
  );
}
