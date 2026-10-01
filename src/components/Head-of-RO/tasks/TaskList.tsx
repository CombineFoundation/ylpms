"use client";

import { useMemo, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { usePagedList } from "@/hooks/usePagedList";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { TaskStatus } from "@/types/task.types";
import { TaskToolbar } from "./TaskToolbar";
import { TaskTable } from "./TaskTable";
import { TaskSubmissionModal } from "@/components/shared/tasks/TaskSubmissionModal";
import { MonthlyTaskButton } from "@/components/shared/tasks/MonthlyTaskButton";
import { TaskFormModal } from "./TaskFormModal";
import {
  endOfLocalDayIso,
  toTaskRow,
  type ApiTask,
  type TaskForm,
  type TaskRow,
  type TaskStatusFilter,
} from "./task-display.types";
import { ActionErrorBanner, PageHeader, emptyMessage } from "../shared/ListParts";

export function TaskList() {
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("open");
  const list = usePagedList<ApiTask>(
    (page) => `/api/tasks?${statusFilter ? `status=${statusFilter}&` : ""}pageSize=50&pageNumber=${page}`,
    `tasks:${statusFilter}`,
    "Unable to load tasks."
  );
  const tasks = useMemo(() => list.items.map(toTaskRow), [list.items]);

  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState<TaskRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) =>
      [t.title, t.description, t.assigneeName, t.priority].some((value) => value.toLowerCase().includes(q))
    );
  }, [tasks, query]);

  const openAddModal = () => {
    setEditingTask(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskRow) => {
    setEditingTask(task);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (values: TaskForm) => {
    setFormError(null);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: endOfLocalDayIso(values.dueDate),
        assignedTo: values.assignedTo,
      };
      if (editingTask) {
        await apiFetch(`/api/tasks/${editingTask.id}`, { method: "PATCH", body: payload });
      } else {
        await apiFetch("/api/tasks", { method: "POST", body: payload });
      }
      setIsModalOpen(false);
      list.reload();
    } catch (error) {
      setFormError(errorMessage(error, "Unable to save task."));
    }
  };

  const handleStatusChange = async (task: TaskRow, status: TaskStatus) => {
    if (status === task.status) return;
    setActionError(null);
    setUpdatingId(task.id);
    try {
      const updated = await apiFetch<ApiTask>(`/api/tasks/${task.id}`, { method: "PATCH", body: { status } });
      // Keep the server's view of the status (e.g. reopening a past-due task yields "overdue").
      list.setItems((current) =>
        current.map((t) => (t.id === task.id ? { ...t, status: updated?.status ?? status } : t))
      );
    } catch (error) {
      setActionError(errorMessage(error, `Unable to update "${task.title}".`));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/tasks/${deletingTask.id}`, { method: "DELETE" });
      list.setItems((current) => current.filter((t) => t.id !== deletingTask.id));
      setDeletingTask(null);
    } catch (error) {
      setActionError(errorMessage(error, "Unable to delete task."));
      setDeletingTask(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered = !!query.trim() || !!statusFilter;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Track and manage all assigned tasks."
        actions={
          <MonthlyTaskButton
            portal="head-ro"
            onAssigned={(message) => {
              setNotice(message);
              list.reload();
            }}
          />
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
      <TaskToolbar
        searchQuery={query}
        onSearchChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAdd={openAddModal}
      />
      <ActionErrorBanner message={actionError} onDismiss={() => setActionError(null)} />
      <TaskTable
        tasks={filteredTasks}
        isLoading={list.isLoading}
        error={list.error}
        emptyMessage={emptyMessage({ isFiltered, noun: "tasks", emptyHint: "Add the first one." })}
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        updatingId={updatingId}
        onLoadMore={list.loadMore}
        onStatusChange={handleStatusChange}
        onEdit={openEditModal}
        onDelete={setDeletingTask}
        onViewSubmission={setViewingSubmission}
      />
      <TaskSubmissionModal task={viewingSubmission} onClose={() => setViewingSubmission(null)} />
      <TaskFormModal
        isOpen={isModalOpen}
        editingTask={editingTask}
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
