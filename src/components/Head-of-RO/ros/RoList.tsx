"use client";

import { useMemo, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { useLoadAllWhileSearching, usePagedList } from "@/hooks/usePagedList";
import { RoTable } from "./RoTable";
import { RoFormModal } from "./RoFormModal";
import type { Ro, RoForm } from "./ro.types";
import { PageHeader, emptyMessage } from "../shared/ListParts";
import { UserToolbar } from "../shared/UserToolbar";
import { useUserAdminActions } from "../shared/useUserAdminActions";
import { matchesQuery, regionOptions, toUserRow, type ApiUser, type StatusFilter } from "../shared/users";

export function RoList() {
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const list = usePagedList<ApiUser>(
    (page) => `/api/users?role=ro${unassignedOnly ? "&unassigned=true" : ""}&pageSize=50&pageNumber=${page}`,
    `ro:${unassignedOnly}`,
    "Unable to load Reporting Officers."
  );
  const ros = useMemo(() => list.items.map(toUserRow), [list.items]);

  const [query, setQuery] = useState("");
  // Search runs on the client, so fetch the remaining pages while searching.
  useLoadAllWhileSearching(list, query);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [regionFilter, setRegionFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRo, setEditingRo] = useState<Ro | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const admin = useUserAdminActions("RO", list.reload);

  const filteredRos = useMemo(
    () =>
      ros.filter(
        (ro) =>
          matchesQuery(ro, query) &&
          (statusFilter === "All" || ro.status === statusFilter) &&
          (!regionFilter || ro.regionLabel === regionFilter)
      ),
    [ros, query, statusFilter, regionFilter]
  );

  const openAddModal = () => {
    setEditingRo(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ro: Ro) => {
    setEditingRo(ro);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (values: RoForm) => {
    setFormError(null);
    try {
      if (editingRo) {
        await apiFetch(`/api/users/${editingRo.id}`, {
          method: "PUT",
          body: { name: values.name, region: values.region, university: values.university, memberId: values.memberId || undefined },
        });
        if (values.sroId !== editingRo.reportingToId) {
          await apiFetch(`/api/users/${editingRo.id}/manager`, {
            method: "PUT",
            body: { managerId: values.sroId || null },
          });
        }
      } else {
        await apiFetch("/api/users", {
          method: "POST",
          body: {
            email: values.email,
            memberId: values.memberId,
            name: values.name,
            region: values.region,
            university: values.university || undefined,
            role: "ro",
            parentId: values.sroId || undefined,
          },
        });
      }
      setIsModalOpen(false);
      list.reload();
    } catch (error) {
      setFormError(errorMessage(error, editingRo ? "Unable to update RO." : "Unable to create RO."));
      // The profile half of an edit may have saved before the reassignment failed.
      if (editingRo) list.reload();
    }
  };

  const isFiltered = !!query.trim() || statusFilter !== "All" || !!regionFilter || unassignedOnly;

  return (
    <div className="space-y-6">
      <PageHeader title="Reporting Officers" description="View and manage all Reporting Officers." />

      <UserToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search ROs by name, email, SRO or region..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        regions={regionOptions(ros)}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        unassignedOnly={{ value: unassignedOnly, onChange: setUnassignedOnly, label: "Without an SRO only" }}
        onAdd={openAddModal}
      />

      <RoTable
        ros={filteredRos}
        isLoading={list.isLoading}
        error={list.error}
        emptyMessage={emptyMessage({ isFiltered, noun: "Reporting Officers", emptyHint: "Add the first one." })}
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        onEdit={openEditModal}
        onDelete={admin.requestDelete}
        onStatusChange={admin.requestStatusChange}
      />

      <RoFormModal
        isOpen={isModalOpen}
        editingRo={editingRo}
        error={formError}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      />
      {admin.dialog}
    </div>
  );
}
