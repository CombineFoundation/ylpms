"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, UserMinus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { apiFetch, apiFetchPage, errorMessage } from "@/lib/api-client";
import { getInitials } from "@/utils/user-status";
import { SearchInput } from "../shared/ListParts";
import type { ApiUser } from "../shared/users";
import type { Sro } from "./sro.types";

type AssignROModalProps = {
  isOpen: boolean;
  sro: Sro | null;
  onClose: () => void;
  /** Called after any successful change so the SRO list can refresh its counts. */
  onChanged: () => void;
};

async function loadAllRos(): Promise<ApiUser[]> {
  const all: ApiUser[] = [];
  for (let page = 1; page <= 20; page++) {
    const { items, meta } = await apiFetchPage<ApiUser>(`/api/users?role=ro&pageSize=100&pageNumber=${page}`);
    all.push(...items);
    if (!meta.hasMore) break;
  }
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Manage which ROs report to an SRO: see the current team (and unassign),
 * and add ROs — unassigned ones, or move them from another SRO.
 */
export function AssignROModal({ isOpen, sro, onClose, onChanged }: AssignROModalProps) {
  const [ros, setRos] = useState<ApiUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsFetching(true);
    setError(null);
    try {
      setRos(await loadAllRos());
    } catch (err) {
      setError(errorMessage(err, "Unable to load ROs."));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setQuery("");
      refresh();
    }
  }, [isOpen]);

  const current = useMemo(() => ros.filter((ro) => ro.reportingToId === sro?.id), [ros, sro]);
  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ros
      .filter((ro) => ro.reportingToId !== sro?.id)
      .filter((ro) => ro.status !== "inactive" && ro.status !== "suspended")
      .filter((ro) => !q || [ro.name, ro.email, ro.region, ro.reportingToName].some((v) => v?.toLowerCase().includes(q)));
  }, [ros, sro, query]);

  const movingCount = candidates.filter((ro) => selectedIds.includes(ro.id) && ro.reportingToId).length;

  const toggle = (id: string) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id]));

  const assignSelected = async () => {
    if (!sro || selectedIds.length === 0) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/users/${sro.id}/assign`, { method: "POST", body: { userIds: selectedIds } });
      setSelectedIds([]);
      await refresh();
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "Unable to assign ROs."));
    } finally {
      setIsSaving(false);
    }
  };

  const unassign = async (ro: ApiUser) => {
    setIsSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/users/${ro.id}/manager`, { method: "PUT", body: { managerId: null } });
      await refresh();
      onChanged();
    } catch (err) {
      setError(errorMessage(err, `Unable to unassign ${ro.name}.`));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title={`Manage ROs for ${sro?.name ?? ""}`} onClose={onClose} isBusy={isSaving} size="lg">
      <div className="space-y-5">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {isFetching && ros.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand" /> Loading ROs...
          </div>
        ) : (
          <>
            <section>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Currently reporting ({current.length})</h3>
              {current.length === 0 ? (
                <p className="text-sm text-gray-400">No ROs report to this SRO yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                  {current.map((ro) => (
                    <li key={ro.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{ro.name}</p>
                        <p className="truncate text-xs text-gray-400">
                          {ro.email}
                          {ro.region ? ` · ${ro.region}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => unassign(ro)}
                        disabled={isSaving}
                        className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 disabled:opacity-50"
                      >
                        <UserMinus className="h-3.5 w-3.5" /> Unassign
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Add ROs</h3>
              <SearchInput value={query} onChange={setQuery} placeholder="Search ROs by name, region or current SRO..." />
              <div className="mt-2 max-h-[40vh] space-y-2 overflow-y-auto">
                {candidates.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    {query.trim() ? "No ROs match your search." : "No other active ROs to add."}
                  </p>
                ) : (
                  candidates.map((ro) => (
                    <label
                      key={ro.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ro.id)}
                        onChange={() => toggle(ro.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-brand"
                      />
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                        {getInitials(ro.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{ro.name}</p>
                        <p className="truncate text-xs text-gray-400">
                          {ro.email}
                          {ro.region ? ` · ${ro.region}` : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          ro.reportingToId ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {ro.reportingToId ? `Under ${ro.reportingToName || "another SRO"}` : "Unassigned"}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
          {movingCount > 0 && (
            <p className="mr-auto text-xs text-amber-700">
              {movingCount} selected RO{movingCount === 1 ? "" : "s"} will be moved from their current SRO.
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Done
          </button>
          <button
            type="button"
            onClick={assignSelected}
            disabled={isSaving || selectedIds.length === 0}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? "Saving..."
              : selectedIds.length === 0
              ? "Assign ROs"
              : `Assign ${selectedIds.length} RO${selectedIds.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
