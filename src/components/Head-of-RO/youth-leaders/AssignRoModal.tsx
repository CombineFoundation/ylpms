"use client";

import { useEffect, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { Modal } from "@/components/ui/Modal";
import { ManagerSelect } from "../shared/ManagerSelect";
import type { UserRow } from "../shared/users";

type AssignRoModalProps = {
  leader: UserRow | null;
  onClose: () => void;
  onAssigned: (message: string) => void;
};

/** Head RO gives a youth leader a (new) RO, e.g. after their RO was deleted. */
export function AssignRoModal({ leader, onClose, onAssigned }: AssignRoModalProps) {
  const [roId, setRoId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leader) return;
    setRoId(leader.reportingToId || "");
    setError(null);
  }, [leader]);

  const save = async () => {
    if (!leader || !roId) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/users/${leader.id}/manager`, { method: "PUT", body: { managerId: roId } });
      onAssigned(`${leader.name} now reports to their new RO.`);
    } catch (err) {
      setError(errorMessage(err, "Unable to assign this RO."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!leader}
      title={leader?.reportingToId ? `Change ${leader.name}'s RO` : `Assign an RO to ${leader?.name ?? ""}`}
      description="The RO approves their activities and volunteer requests, and assigns their monthly tasks."
      onClose={onClose}
      isBusy={isSaving}
    >
      <div className="space-y-4">
        <label htmlFor="assign-ro" className="block text-sm font-medium text-gray-700">
          Reporting Officer
        </label>
        <ManagerSelect id="assign-ro" roles={["ro"]} value={roId} onChange={setRoId} allowUnassigned={false} placeholder="Choose an RO" />
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isSaving || !roId || roId === leader?.reportingToId}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
