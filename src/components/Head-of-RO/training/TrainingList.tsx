"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { useLoadAllWhileSearching, usePagedList } from "@/hooks/usePagedList";
import { uploadTrainingFile } from "@/lib/training-files";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TrainingFormModal } from "./TrainingFormModal";
import { TrainingGrid } from "./TrainingGrid";
import { TYPE_FILTERS, type ApiTrainingResource, type TrainingForm, type TypeFilter } from "./training.types";
import { ActionErrorBanner, FilterPills, PageHeader, SearchInput, emptyMessage } from "../shared/ListParts";

const SRO_SCOPES = [
  { value: "mine", label: "My resources" },
  { value: "library", label: "Library" },
] as const;
type SroScope = (typeof SRO_SCOPES)[number]["value"];

type TrainingListProps = {
  /**
   * When set (SRO portal), the viewer manages only resources they authored:
   * "My resources" lists theirs (drafts included), "Library" lists what's published to SROs.
   */
  authorId?: string;
};

/** Training Portal: Head RO (all resources) or SRO (own resources) creates, edits, publishes and removes training. */
export function TrainingList({ authorId }: TrainingListProps = {}) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [scope, setScope] = useState<SroScope>("mine");
  const mine = !!authorId && scope === "mine";
  const list = usePagedList<ApiTrainingResource>(
    (page) =>
      `/api/training?${mine ? "mine=true&" : ""}${typeFilter ? `type=${typeFilter}&` : ""}pageSize=30&pageNumber=${page}`,
    `training:${mine}:${typeFilter}`,
    "Unable to load training resources."
  );
  const canManage = (resource: ApiTrainingResource) => !authorId || resource.authorId === authorId;

  const [query, setQuery] = useState("");
  // Search runs on the client, so fetch the remaining pages while searching.
  useLoadAllWhileSearching(list, query);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiTrainingResource | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ApiTrainingResource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list.items;
    return list.items.filter((resource) =>
      [resource.title, resource.description, resource.category, resource.authorName].some((value) =>
        value?.toLowerCase().includes(q)
      )
    );
  }, [list.items, query]);

  const openAdd = () => {
    setEditing(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (resource: ApiTrainingResource) => {
    setEditing(resource);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (values: TrainingForm, file: File | null) => {
    setFormError(null);
    const duration = values.type === "video" && values.duration ? values.duration : undefined;
    const pages = values.type !== "video" && values.type !== "assignment" && values.pages ? Number(values.pages) : undefined;
    const body = {
      title: values.title,
      description: values.description,
      type: values.type,
      category: values.category,
      audience: values.audience,
      published: values.published,
    };
    try {
      // A new upload goes first; editing without choosing one keeps the current file.
      setUploadProgress(file ? `Uploading ${file.name}...` : null);
      const uploaded = file ? await uploadTrainingFile(file, values.type) : undefined;
      setUploadProgress(file ? "Saving..." : null);
      const source = values.source === "link" ? { url: values.url } : uploaded ? { file: uploaded } : {};
      if (editing) {
        await apiFetch(`/api/training/${editing.id}`, {
          method: "PATCH",
          // null clears values that no longer apply to the chosen type.
          body: { ...body, ...source, duration: duration ?? null, pages: pages ?? null },
        });
      } else {
        await apiFetch("/api/training", { method: "POST", body: { ...body, ...source, duration, pages } });
      }
      setIsModalOpen(false);
      list.reload();
    } catch (error) {
      setFormError(errorMessage(error, "Unable to save training resource."));
    } finally {
      setUploadProgress(null);
    }
  };

  const togglePublished = async (resource: ApiTrainingResource) => {
    setActionError(null);
    try {
      const updated = await apiFetch<ApiTrainingResource>(`/api/training/${resource.id}`, {
        method: "PATCH",
        body: { published: !resource.published },
      });
      list.setItems((current) => current.map((item) => (item.id === resource.id ? updated : item)));
    } catch (error) {
      setActionError(errorMessage(error, "Unable to update that resource."));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/training/${deleting.id}`, { method: "DELETE" });
      list.setItems((current) => current.filter((item) => item.id !== deleting.id));
    } catch (error) {
      setActionError(errorMessage(error, "Unable to delete that resource."));
    } finally {
      setIsDeleting(false);
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Portal"
        description="Videos, documents, slides and assignments for your teams."
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" /> Add Resource
          </button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:w-96">
          <SearchInput value={query} onChange={setQuery} placeholder="Search training by title or category..." />
        </div>
        {authorId && <FilterPills label="Show" options={SRO_SCOPES} value={scope} onChange={setScope} />}
        <FilterPills label="Type" options={TYPE_FILTERS} value={typeFilter} onChange={setTypeFilter} />
      </div>

      <ActionErrorBanner message={actionError} onDismiss={() => setActionError(null)} />

      <TrainingGrid
        resources={filtered}
        isLoading={list.isLoading}
        error={list.error}
        emptyMessage={emptyMessage({ isFiltered: !!query.trim() || !!typeFilter, noun: "training resources", emptyHint: "Add the first one." })}
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        onEdit={openEdit}
        onTogglePublished={togglePublished}
        onDelete={setDeleting}
        canManage={canManage}
      />

      <TrainingFormModal
        isOpen={isModalOpen}
        editing={editing}
        error={formError}
        progress={uploadProgress}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete training resource?"
        message={`"${deleting?.title}" will be removed for everyone.`}
        confirmLabel="Delete"
        tone="danger"
        isBusy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
