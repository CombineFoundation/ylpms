"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { scopedPath } from "@/hooks/usePortalScope";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type MonthlyTaskStatus = {
  cycle: { number: number; label: string; rangeLabel: string; dueLabel: string } | null;
  templates: { role: string; roleName: string; tasks: { title: string }[] }[];
  recipients: number;
  pending: number;
  state: "ready" | "assigned" | "not-started" | "no-tasks" | "no-recipients";
};

type MonthlyTaskButtonProps = {
  /** The Tasks page it's on; SRO / RO assign to their own team, Head RO to everyone. */
  portal: "head-ro" | "sro" | "ro";
  /** Set when a developer is acting as an SRO / RO. */
  selectedId?: string | null;
  isReady?: boolean;
  onAssigned: (message: string) => void;
};

const scopeCopy = { "head-ro": "the program", sro: "your team", ro: "your team" };

/**
 * "Assign Monthly Task": gives this program month's task list (15th → 15th) to
 * every active or idle youth leader in scope. Turns into "Monthly Tasks Assigned"
 * once everyone has them — whoever assigned them.
 */
export function MonthlyTaskButton({ portal, selectedId = null, isReady = true, onAssigned }: MonthlyTaskButtonProps) {
  const [status, setStatus] = useState<MonthlyTaskStatus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const path = portal === "head-ro" ? "/api/tasks/monthly" : scopedPath("/api/tasks/monthly", portal, selectedId);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setStatus(await apiFetch<MonthlyTaskStatus>(path));
    } catch (error) {
      setLoadError(errorMessage(error, "Couldn't check this month's tasks."));
    }
  }, [path]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  const assign = async () => {
    setIsAssigning(true);
    setAssignError(null);
    try {
      const result = await apiFetch<{ cycle: string; tasksCreated: number; usersAssigned: number }>(path, { method: "POST" });
      setIsConfirming(false);
      onAssigned(`${result.cycle} tasks assigned: ${result.tasksCreated} task(s) to ${result.usersAssigned} youth leader(s).`);
      load();
    } catch (error) {
      setAssignError(errorMessage(error, "Unable to assign monthly tasks."));
    } finally {
      setIsAssigning(false);
    }
  };

  if (!status) {
    return (
      <button
        type="button"
        disabled
        title={loadError ?? undefined}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-400"
      >
        <CalendarPlus className="h-4 w-4" /> {loadError ? "Monthly tasks unavailable" : "Assign Monthly Task"}
      </button>
    );
  }

  const cycle = status.cycle;
  if (status.state === "assigned") {
    return (
      <span
        title={`${cycle?.label} tasks are assigned to all ${status.recipients} active youth leaders in ${scopeCopy[portal]}.`}
        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
      >
        <CalendarCheck className="h-4 w-4" /> {cycle?.label} Tasks Assigned
      </span>
    );
  }

  const disabledReason =
    status.state === "not-started"
      ? "Month 1 starts on Sep 15, 2026."
      : status.state === "no-tasks"
        ? `No tasks have been set for ${cycle?.label} yet.`
        : status.state === "no-recipients"
          ? `No active or idle youth leaders in ${scopeCopy[portal]} to assign to.`
          : null;
  const isPartial = status.pending < status.recipients;

  return (
    <>
      <button
        type="button"
        disabled={!!disabledReason}
        title={disabledReason ?? `${cycle?.label} · ${cycle?.rangeLabel}`}
        onClick={() => {
          setAssignError(null);
          setIsConfirming(true);
        }}
        className="flex items-center gap-1.5 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
      >
        <CalendarPlus className="h-4 w-4" />
        Assign Monthly Task
        {isPartial && status.state === "ready" && <span className="text-xs font-normal">({status.pending} pending)</span>}
      </button>

      <ConfirmDialog
        isOpen={isConfirming}
        title={`Assign ${cycle?.label} tasks?`}
        message={
          <div className="space-y-3">
            <p>
              {cycle?.rangeLabel} · due <span className="font-medium text-gray-800">{cycle?.dueLabel}</span>. Goes to{" "}
              <span className="font-medium text-gray-800">{status.pending}</span> active or idle youth{" "}
              {status.pending === 1 ? "leader" : "leaders"} in {scopeCopy[portal]}
              {isPartial ? ` who don't have them yet (${status.recipients - status.pending} already do)` : ""}. Inactive and
              never-signed-in accounts are skipped.
            </p>
            {status.templates.map((group) => (
              <div key={group.role}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">For {group.roleName}</p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-gray-700">
                  {group.tasks.map((task) => (
                    <li key={task.title}>{task.title}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        }
        confirmLabel="Assign tasks"
        isBusy={isAssigning}
        error={assignError}
        onConfirm={assign}
        onCancel={() => !isAssigning && setIsConfirming(false)}
      />
    </>
  );
}
