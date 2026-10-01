"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiFetch, errorMessage } from "@/lib/api-client";
import type { UserStatus } from "@/types/user.types";
import type { UserRow } from "./users";

type PendingAction =
  | { kind: "delete"; user: UserRow; impact: { directReports: number; openTasks: number } | null }
  | { kind: "status"; user: UserRow; status: UserStatus };

const statusVerb: Record<UserStatus, string> = {
  active: "Reactivate",
  inactive: "Deactivate",
  suspended: "Suspend",
  pending: "Reset",
};

/**
 * Delete / suspend / deactivate / reactivate flow for user list screens.
 * Delete first fetches what it would affect (direct reports, open tasks) and
 * offers "Deactivate instead" as the non-destructive alternative.
 */
export function useUserAdminActions(noun: string, onChanged: () => void) {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (isBusy) return;
    setPending(null);
    setError(null);
  };

  const requestDelete = async (user: UserRow) => {
    setError(null);
    setPending({ kind: "delete", user, impact: null });
    try {
      const data = await apiFetch<{ deletionImpact: { directReports: number; openTasks: number } }>(
        `/api/users/${user.id}?include=deletion-impact`
      );
      setPending((current) =>
        current?.kind === "delete" && current.user.id === user.id ? { ...current, impact: data.deletionImpact } : current
      );
    } catch (err) {
      setError(errorMessage(err, "Unable to check what this would affect."));
    }
  };

  const requestStatusChange = (user: UserRow, status: UserStatus) => {
    setError(null);
    setPending({ kind: "status", user, status });
  };

  const run = async (action: () => Promise<unknown>) => {
    setIsBusy(true);
    setError(null);
    try {
      await action();
      setPending(null);
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "That didn't work. Please try again."));
    } finally {
      setIsBusy(false);
    }
  };

  const setStatus = (user: UserRow, status: UserStatus) =>
    run(() => apiFetch(`/api/users/${user.id}`, { method: "PUT", body: { status } }));

  let dialog = null;
  if (pending?.kind === "delete") {
    const { user, impact } = pending;
    const alreadyInactive = user.storedStatus === "inactive";
    dialog = (
      <ConfirmDialog
        isOpen
        title={`Delete ${user.name}?`}
        tone="danger"
        confirmLabel="Delete permanently"
        isBusy={isBusy}
        error={error}
        message={
          <div className="space-y-2">
            <p>This permanently removes the {noun}&apos;s account and sign-in. It can&apos;t be undone.</p>
            {impact === null && !error ? (
              <p className="text-gray-400">Checking what this affects…</p>
            ) : impact ? (
              <ul className="list-disc pl-5">
                <li>
                  {impact.directReports} direct report{impact.directReports === 1 ? "" : "s"} will become unassigned.
                </li>
                <li>
                  {impact.openTasks} open task{impact.openTasks === 1 ? "" : "s"} assigned to them will be cancelled.
                </li>
              </ul>
            ) : null}
            {!alreadyInactive && <p>To keep their history, deactivate the account instead.</p>}
          </div>
        }
        secondaryAction={alreadyInactive ? undefined : { label: "Deactivate instead", onClick: () => setStatus(user, "inactive") }}
        onConfirm={() => run(() => apiFetch(`/api/users/${user.id}`, { method: "DELETE" }))}
        onCancel={close}
      />
    );
  } else if (pending?.kind === "status") {
    const { user, status } = pending;
    const verb = statusVerb[status];
    dialog = (
      <ConfirmDialog
        isOpen
        title={`${verb} ${user.name}?`}
        tone={status === "active" ? "primary" : "danger"}
        confirmLabel={verb}
        isBusy={isBusy}
        error={error}
        message={
          status === "active"
            ? "They'll be able to sign in again."
            : "They'll be signed out immediately and won't be able to sign in until reactivated."
        }
        onConfirm={() => setStatus(user, status)}
        onCancel={close}
      />
    );
  }

  return { requestDelete, requestStatusChange, dialog };
}
