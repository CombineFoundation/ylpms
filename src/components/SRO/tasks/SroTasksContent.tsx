"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeepLinkId } from "@/hooks/useDeepLinkId";
import { Plus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { scopedPath, usePortalData, usePortalScope, type ScopedRole } from "@/hooks/usePortalScope";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ActionErrorBanner,
  FilterPills,
  PageHeader,
  SearchInput,
  emptyMessage,
} from "@/components/Head-of-RO/shared/ListParts";
import type { TaskStatus } from "@/types/task.types";
import { SroTaskTable } from "./SroTaskTable";
import { SroTaskFormModal } from "./SroTaskFormModal";
import { TaskSubmitModal } from "@/components/shared/tasks/TaskSubmitModal";
import { TaskDetailModal } from "@/components/shared/tasks/TaskDetailModal";
import { MyTaskCards } from "./MyTaskCards";
import { MonthlyTaskButton } from "@/components/shared/tasks/MonthlyTaskButton";
import { TaskSubmissionModal } from "@/components/shared/tasks/TaskSubmissionModal";
import { saveSroTask } from "./sro-task.api";
import { toSroTaskRow, type SroTaskForm, type SroTaskRow, type SroTasksResponse } from "./sro-task.types";

const VIEW_FILTERS = [
  { value: "open", label: "Open" },
  { value: "submitted", label: "In Review" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Done" },
  { value: "all", label: "All" },
] as const;
type ViewFilter = (typeof VIEW_FILTERS)[number]["value"];

function matchesView(task: SroTaskRow, view: ViewFilter) {
  if (view === "all") return true;
  if (view === "open") return task.status !== "completed" && task.status !== "cancelled";
  return task.status === view;
}

const pageCopy: Record<ScopedRole, string> = {
  sro: "Tasks assigned to you by the Head RO, and tasks you assign to your team.",
  ro: "Tasks assigned to you by your SRO, and tasks you assign to your youth leaders and volunteers.",
  "youth-leader": "Tasks assigned to you by your RO, and tasks you assign to your volunteers.",
  volunteer: "Tasks assigned to you. Update the status as you go, then submit your work for review.",
};

/**
 * Tasks assigned to the user, and (for managers) tasks they assign to their
 * team. Volunteers only receive tasks, so they get just the first list.
 */
export function TeamTasksContent({ portal }: { portal: ScopedRole }) {
  const canAssign = portal !== "volunteer";
  const { selectedId, isReady } = usePortalScope(portal);
  const [notice, setNotice] = useState<string | null>(null);
  const { data, setData, isLoading, error: loadError, reload: load } = usePortalData<SroTasksResponse>(
    portal,
    `/api/${portal}/tasks`,
    "Unable to load tasks."
  );
  const [view, setView] = useState<ViewFilter>("open");
  const [query, setQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SroTaskRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<SroTaskRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submittingTask, setSubmittingTask] = useState<SroTaskRow | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<SroTaskRow | null>(null);
  /** The task whose details are open, and which list it was opened from. */
  const [openTask, setOpenTask] = useState<{ task: SroTaskRow; mode: "mine" | "team" | "view" } | null>(null);

  // A notification's link (?taskId=) opens that task once the lists have loaded.
  const [linkedTaskId, consumeLinkedTask] = useDeepLinkId("taskId");
  useEffect(() => {
    if (!linkedTaskId || !data) return;
    const lists = [
      ["mine", data.assignedToMe],
      ["team", data.assignedByMe],
      ["view", data.teamMonthly ?? []],
    ] as const;
    for (const [mode, list] of lists) {
      const task = list.find((t) => t.id === linkedTaskId);
      if (task) {
        const row = toSroTaskRow(task);
        // Work waiting for this person's review opens straight on the submission.
        if (mode === "team" && row.status === "submitted") setViewingSubmission(row);
        else setOpenTask({ task: row, mode });
        break;
      }
    }
    consumeLinkedTask();
  }, [linkedTaskId, data, consumeLinkedTask]);

  useEffect(() => {
    // The dashboard's "Assign Task" button links here with ?new=1.
    if (canAssign && new URLSearchParams(window.location.search).get("new") === "1") openAddModal();
  }, [canAssign]);

  const filterRows = useCallback(
    (rows: SroTaskRow[]) => {
      const q = query.trim().toLowerCase();
      return rows.filter(
        (t) =>
          matchesView(t, view) &&
          (!q || [t.title, t.description, t.assigneeName, t.assignerName].some((value) => value?.toLowerCase().includes(q)))
      );
    },
    [query, view]
  );

  const myTasks = useMemo(() => filterRows((data?.assignedToMe ?? []).map(toSroTaskRow)), [data, filterRows]);
  const teamTasks = useMemo(() => filterRows((data?.assignedByMe ?? []).map(toSroTaskRow)), [data, filterRows]);
  const monthlyTasks = useMemo(() => filterRows((data?.teamMonthly ?? []).map(toSroTaskRow)), [data, filterRows]);

  function openAddModal() {
    setEditingTask(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  const handleSave = async (values: SroTaskForm) => {
    setFormError(null);
    try {
      await saveSroTask(values, editingTask?.id, selectedId, portal);
      setIsModalOpen(false);
      load();
    } catch (error) {
      setFormError(errorMessage(error, "Unable to save task."));
    }
  };

  const handleStatusChange = async (task: SroTaskRow, status: TaskStatus) => {
    if (status === task.status) return;
    setActionError(null);
    setUpdatingId(task.id);
    try {
      const updated = await apiFetch<{ status: TaskStatus }>(`/api/tasks/${task.id}`, { method: "PATCH", body: { status } });
      // Keep the server's view of the status (e.g. reopening a past-due task yields "overdue").
      const apply = (list: SroTasksResponse["assignedToMe"]) =>
        list.map((t) => (t.id === task.id ? { ...t, status: updated?.status ?? status } : t));
      setData((current) =>
        current && { ...current, assignedToMe: apply(current.assignedToMe), assignedByMe: apply(current.assignedByMe) }
      );
    } catch (error) {
      setActionError(errorMessage(error, `Unable to update "${task.title}".`));
    } finally {
      setUpdatingId(null);
    }
  };

  /** Takes back a submission before it's reviewed, so it can be fixed and submitted again. */
  const handleWithdraw = async (task: SroTaskRow) => {
    setActionError(null);
    setUpdatingId(task.id);
    try {
      await apiFetch(scopedPath(`/api/tasks/${task.id}/withdraw`, portal, selectedId), { method: "POST" });
      setNotice(`"${task.title}" was withdrawn. Make your changes and submit it again.`);
      load();
    } catch (error) {
      setActionError(errorMessage(error, `Unable to withdraw "${task.title}".`));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/tasks/${deletingTask.id}`, { method: "DELETE" });
      setData(
        (current) => current && { ...current, assignedByMe: current.assignedByMe.filter((t) => t.id !== deletingTask.id) }
      );
    } catch (error) {
      setActionError(errorMessage(error, "Unable to delete task."));
    } finally {
      setIsDeleting(false);
      setDeletingTask(null);
    }
  };

  // "Nothing matches your filters" only when the list has tasks the search/filter hid;
  // an empty list says so plainly (the default "Open" filter alone isn't the user's doing).
  const filteredOut = (all?: unknown[]) => (all?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={pageCopy[portal]}
        actions={
          canAssign && (
            <>
              {(portal === "sro" || portal === "ro") && (
                <MonthlyTaskButton
                  portal={portal}
                  selectedId={selectedId}
                  isReady={isReady}
                  onAssigned={(message) => {
                    setNotice(message);
                    load();
                  }}
                />
              )}
              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                <Plus className="h-4 w-4" /> Assign Task
              </button>
            </>
          )
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:w-96">
          <SearchInput value={query} onChange={setQuery} placeholder="Search tasks or people..." />
        </div>
        <FilterPills label="Show" options={VIEW_FILTERS} value={view} onChange={setView} />
      </div>

      <ActionErrorBanner message={actionError} onDismiss={() => setActionError(null)} />

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-700">
          Assigned to me {data && <span className="font-normal text-gray-400">({myTasks.length})</span>}
        </h2>
        <MyTaskCards
          className="sm:hidden"
          tasks={myTasks}
          isLoading={isLoading}
          error={loadError}
          emptyMessage={emptyMessage({ isFiltered: filteredOut(data?.assignedToMe), noun: "tasks assigned to you" })}
          updatingId={updatingId}
          onOpen={(task) => setOpenTask({ task, mode: "mine" })}
          onSubmit={setSubmittingTask}
        />
        <div className="hidden sm:block">
          <SroTaskTable
            mode="mine"
            tasks={myTasks}
            isLoading={isLoading}
            error={loadError}
            emptyMessage={emptyMessage({ isFiltered: filteredOut(data?.assignedToMe), noun: "tasks assigned to you" })}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
            onSubmit={setSubmittingTask}
            onViewSubmission={setViewingSubmission}
            onWithdraw={handleWithdraw}
            onOpen={(task) => setOpenTask({ task, mode: "mine" })}
          />
        </div>
      </section>

      {canAssign && (
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <h2 className="border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-700">
            Assigned by me {data && <span className="font-normal text-gray-400">({teamTasks.length})</span>}
          </h2>
          <SroTaskTable
            mode="team"
            tasks={teamTasks}
            isLoading={isLoading}
            error={loadError}
            emptyMessage={emptyMessage({ isFiltered: filteredOut(data?.assignedByMe), noun: "team tasks", emptyHint: "Assign the first one." })}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
            onEdit={(task) => {
              setEditingTask(task);
              setFormError(null);
              setIsModalOpen(true);
            }}
            onDelete={setDeletingTask}
            onViewSubmission={setViewingSubmission}
            onOpen={(task) => setOpenTask({ task, mode: "team" })}
          />
        </section>
      )}

      {portal === "sro" && (
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Youth leaders&apos; monthly tasks {data && <span className="font-normal text-gray-400">({monthlyTasks.length})</span>}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">View only. Each youth leader&apos;s RO reviews these.</p>
          </div>
          <SroTaskTable
            mode="view"
            tasks={monthlyTasks}
            isLoading={isLoading}
            error={loadError}
            emptyMessage={emptyMessage({ isFiltered: filteredOut(data?.teamMonthly), noun: "monthly tasks" })}
            updatingId={null}
            onStatusChange={() => {}}
            onViewSubmission={setViewingSubmission}
            onOpen={(task) => setOpenTask({ task, mode: "view" })}
          />
        </section>
      )}

      <TaskDetailModal
        task={openTask?.task ?? null}
        mode={openTask?.mode ?? "mine"}
        onClose={() => setOpenTask(null)}
        onSubmit={setSubmittingTask}
        onWithdraw={handleWithdraw}
        onViewSubmission={setViewingSubmission}
      />
      <TaskSubmitModal
        task={submittingTask}
        portal={portal}
        selectedId={selectedId}
        onClose={() => setSubmittingTask(null)}
        onSubmitted={() => {
          setSubmittingTask(null);
          // Reload so the row picks up its status and the saved submission.
          load();
        }}
      />
      <TaskSubmissionModal
        task={viewingSubmission}
        // Only the assigner reviews: tasks in "Assigned by me".
        canReview={!!viewingSubmission && !!data?.assignedByMe.some((t) => t.id === viewingSubmission.id)}
        onClose={() => setViewingSubmission(null)}
        onReviewed={() => {
          setViewingSubmission(null);
          load();
        }}
      />

      <SroTaskFormModal
        isOpen={isModalOpen}
        editingTask={editingTask}
        assignees={data?.assignees ?? []}
        activities={data?.openActivities}
        error={formError}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={!!deletingTask}
        title="Delete task?"
        message={`"${deletingTask?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        tone="danger"
        isBusy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}

/** The SRO portal's Tasks page. */
export function SroTasksContent() {
  return <TeamTasksContent portal="sro" />;
}
