"use client";

import { useMemo, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { useSroData, useSroScope } from "@/hooks/usePortalScope";
import { FilterPills, PageHeader, SearchInput, emptyMessage } from "@/components/Head-of-RO/shared/ListParts";
import { STATUS_FILTER_OPTIONS, type StatusFilter } from "@/components/Head-of-RO/shared/users";
import { SroTaskFormModal } from "../tasks/SroTaskFormModal";
import { saveSroTask } from "../tasks/sro-task.api";
import type { SroTaskForm } from "../tasks/sro-task.types";
import { AssignedROTable } from "./AssignedROTable";
import { EditROModal } from "./EditROModal";
import type { AssignedRO, EditROForm } from "./assigned-ro.types";

/** The SRO's own ROs: team size, workload, performance, plus assign-task and edit. */
export function AssignedROList() {
  const { selectedId } = useSroScope();
  const { data, setData, isLoading, error: loadError, reload: load } = useSroData<AssignedRO[]>(
    "/api/sro/ros",
    "Unable to load your ROs."
  );
  const ros = useMemo(() => data ?? [], [data]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [assigningTo, setAssigningTo] = useState<AssignedRO | null>(null);
  const [editing, setEditing] = useState<AssignedRO | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ros.filter(
      (ro) =>
        (statusFilter === "All" || ro.status === statusFilter) &&
        (!q || [ro.name, ro.email ?? "", ro.region ?? ""].some((value) => value.toLowerCase().includes(q)))
    );
  }, [ros, search, statusFilter]);

  const assignees = useMemo(() => ros.map((ro) => ({ id: ro.id, name: ro.name, role: "ro" as const })), [ros]);

  const handleAssign = async (values: SroTaskForm) => {
    setFormError(null);
    try {
      await saveSroTask(values, undefined, selectedId);
      const assignee = ros.find((ro) => ro.id === values.assignedTo);
      setAssigningTo(null);
      setNotice(`Task "${values.title}" assigned${assignee ? ` to ${assignee.name}` : ""}.`);
      load();
    } catch (error) {
      setFormError(errorMessage(error, "Unable to assign task."));
    }
  };

  const handleEdit = async (values: EditROForm) => {
    if (!editing) return;
    setFormError(null);
    try {
      await apiFetch(`/api/users/${editing.id}`, { method: "PUT", body: values });
      setData((current) => current && current.map((ro) => (ro.id === editing.id ? { ...ro, ...values } : ro)));
      setEditing(null);
    } catch (error) {
      setFormError(errorMessage(error, "Unable to update this RO."));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Reporting Officers"
        description={
          isLoading ? "Loading your team..." : `You have ${ros.length} assigned RO${ros.length === 1 ? "" : "s"}.`
        }
      />

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-xs font-medium hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center">
          <div className="lg:w-80">
            <SearchInput value={search} onChange={setSearch} placeholder="Search ROs by name, email or region..." />
          </div>
          <FilterPills label="Status" options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <AssignedROTable
          ros={filtered}
          isLoading={isLoading}
          error={loadError}
          emptyMessage={emptyMessage({
            isFiltered: !!search.trim() || statusFilter !== "All",
            noun: "assigned ROs",
            emptyHint: "Ask the Head RO to assign Reporting Officers to you.",
          })}
          onAssignTask={(ro) => {
            setFormError(null);
            setAssigningTo(ro);
          }}
          onEdit={(ro) => {
            setFormError(null);
            setEditing(ro);
          }}
        />
      </div>

      <SroTaskFormModal
        isOpen={!!assigningTo}
        editingTask={null}
        assignees={assignees}
        defaultAssigneeId={assigningTo?.id}
        error={formError}
        onClose={() => setAssigningTo(null)}
        onSubmit={handleAssign}
      />
      <EditROModal ro={editing} error={formError} onClose={() => setEditing(null)} onSubmit={handleEdit} />
    </div>
  );
}
