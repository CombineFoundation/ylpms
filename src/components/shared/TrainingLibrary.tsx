"use client";

import { useMemo, useState } from "react";
import { usePagedList } from "@/hooks/usePagedList";
import { TrainingGrid } from "@/components/Head-of-RO/training/TrainingGrid";
import { TYPE_FILTERS, type ApiTrainingResource, type TypeFilter } from "@/components/Head-of-RO/training/training.types";
import { FilterPills, PageHeader, SearchInput, emptyMessage } from "@/components/Head-of-RO/shared/ListParts";

const noop = () => {};

/**
 * Read-only Training Portal for learners (RO, Youth Leader, Volunteer): every
 * published resource from the Head RO and SROs.
 */
export function TrainingLibrary() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const list = usePagedList<ApiTrainingResource>(
    (page) => `/api/training?${typeFilter ? `type=${typeFilter}&` : ""}pageSize=30&pageNumber=${page}`,
    `training-library:${typeFilter}`,
    "Unable to load training resources."
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list.items;
    return list.items.filter((resource) =>
      [resource.title, resource.description, resource.category, resource.authorName].some((value) =>
        value?.toLowerCase().includes(q)
      )
    );
  }, [list.items, query]);

  return (
    <div className="w-full space-y-6">
      <PageHeader title="Training" description="Videos, documents, slides and assignments from the Head RO and SROs." />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:w-96">
          <SearchInput value={query} onChange={setQuery} placeholder="Search training by title, category or author..." />
        </div>
        <FilterPills label="Type" options={TYPE_FILTERS} value={typeFilter} onChange={setTypeFilter} />
      </div>

      <TrainingGrid
        resources={filtered}
        isLoading={list.isLoading}
        error={list.error}
        emptyMessage={emptyMessage({ isFiltered: !!query.trim() || !!typeFilter, noun: "training resources" })}
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        onEdit={noop}
        onTogglePublished={noop}
        onDelete={noop}
        canManage={() => false}
      />
    </div>
  );
}
