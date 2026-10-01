"use client";

import { useState } from "react";
import { Filter, Plus } from "lucide-react";
import { FilterPills, SearchInput } from "./ListParts";
import { STATUS_FILTER_OPTIONS, type StatusFilter } from "./users";

type UserToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  regions: string[];
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  /** What the region field means for these users, e.g. "City" for youth leaders and volunteers. */
  regionLabel?: string;
  /** e.g. "Unassigned only" toggle for screens where managers matter. */
  unassignedOnly?: { value: boolean; onChange: (value: boolean) => void; label: string };
  addLabel?: string;
  onAdd?: () => void;
};

/** Search + status/region filters (+ optional add button) for the user list screens. */
export function UserToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  statusFilter,
  onStatusFilterChange,
  regions,
  regionFilter,
  onRegionFilterChange,
  regionLabel = "Region",
  unassignedOnly,
  addLabel = "Add New",
  onAdd,
}: UserToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const activeFilters =
    (statusFilter !== "All" ? 1 : 0) + (regionFilter ? 1 : 0) + (unassignedOnly?.value ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={onQueryChange} placeholder={searchPlaceholder} />
        <button
          type="button"
          onClick={() => setIsFilterOpen((open) => !open)}
          aria-expanded={isFilterOpen}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filter{activeFilters > 0 ? ` (${activeFilters})` : ""}
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </button>
        )}
      </div>

      {isFilterOpen && (
        <div className="space-y-3 rounded-lg border border-gray-100 bg-white p-4">
          <FilterPills label="Status" options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={onStatusFilterChange} />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{regionLabel}:</span>
              <select
                value={regionFilter}
                onChange={(event) => onRegionFilterChange(event.target.value)}
                className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700"
              >
                <option value="">All {regionLabel === "City" ? "cities" : `${regionLabel.toLowerCase()}s`}</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            {unassignedOnly && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={unassignedOnly.value}
                  onChange={(event) => unassignedOnly.onChange(event.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                {unassignedOnly.label}
              </label>
            )}
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={() => {
                  onStatusFilterChange("All");
                  onRegionFilterChange("");
                  unassignedOnly?.onChange(false);
                }}
                className="text-xs font-medium text-brand hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
