"use client";

import { useMemo, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { usePagedList } from "@/hooks/usePagedList";
import { SroFormModal } from "./SroFormModal";
import { AssignROModal } from "./AssignROModal";
import { SroTable } from "./SroTable";
import type { Sro, SroForm } from "./sro.types";
import { PageHeader, emptyMessage } from "../shared/ListParts";
import { UserToolbar } from "../shared/UserToolbar";
import { useUserAdminActions } from "../shared/useUserAdminActions";
import { matchesQuery, regionOptions, toUserRow, type ApiUser, type StatusFilter } from "../shared/users";

export function SroList() {
  const list = usePagedList<ApiUser>(
    (page) => `/api/users?role=sro&pageSize=50&pageNumber=${page}`,
    "sro",
    "Unable to load SROs."
  );
  const sros = useMemo(() => list.items.map(toUserRow), [list.items]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [regionFilter, setRegionFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSro, setEditingSro] = useState<Sro | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [manageSro, setManageSro] = useState<Sro | null>(null);

  const admin = useUserAdminActions("SRO", list.reload);

  const filteredSros = useMemo(
    () =>
      sros.filter(
        (sro) =>
          matchesQuery(sro, query) &&
          (statusFilter === "All" || sro.status === statusFilter) &&
          (!regionFilter || sro.regionLabel === regionFilter)
      ),
    [sros, query, statusFilter, regionFilter]
  );

  const openAddModal = () => {
    setEditingSro(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sro: Sro) => {
    setEditingSro(sro);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (values: SroForm) => {
    setFormError(null);
    try {
      if (editingSro) {
        await apiFetch(`/api/users/${editingSro.id}`, {
          method: "PUT",
          body: { name: values.name, region: values.region, university: values.university, memberId: values.memberId || undefined },
        });
      } else {
        await apiFetch("/api/users", {
          method: "POST",
          body: {
            email: values.email,
            memberId: values.memberId,
            name: values.name,
            region: values.region,
            university: values.university || undefined,
            role: "sro",
          },
        });
      }
      setIsModalOpen(false);
      list.reload();
    } catch (error) {
      setFormError(errorMessage(error, editingSro ? "Unable to update SRO." : "Unable to create SRO."));
    }
  };

  const isFiltered = !!query.trim() || statusFilter !== "All" || !!regionFilter;

  return (
    <div className="space-y-6">
      <PageHeader title="Senior Reporting Officers" description="Manage and assign SROs across all regions." />
      <UserToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search SROs by name, email or region..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        regions={regionOptions(sros)}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        onAdd={openAddModal}
      />
      <SroTable
        sros={filteredSros}
        isLoading={list.isLoading}
        error={list.error}
        emptyMessage={emptyMessage({ isFiltered, noun: "SROs", emptyHint: "Add the first one." })}
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        onEdit={openEditModal}
        onDelete={admin.requestDelete}
        onStatusChange={admin.requestStatusChange}
        onManageROs={setManageSro}
      />
      <SroFormModal
        isOpen={isModalOpen}
        editingSro={editingSro}
        error={formError}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      />
      <AssignROModal isOpen={!!manageSro} sro={manageSro} onClose={() => setManageSro(null)} onChanged={list.reload} />
      {admin.dialog}
    </div>
  );
}
