"use client";

import { useState } from "react";
import { Download, ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { openTrainingFile } from "@/lib/training-files";
import { INLINE_TRAINING_TYPES } from "@/utils/training-upload-rules";
import { LoadMoreButton } from "../shared/ListParts";
import { typeLabels, typeStyles, type ApiTrainingResource } from "./training.types";

/** "Open" for a link; "Open"/"Download" for an uploaded file (fetched with the viewer's sign-in). */
function ResourceOpenButton({ resource }: { resource: ApiTrainingResource }) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const linkClass = "flex items-center gap-1 text-xs font-medium text-brand hover:underline disabled:opacity-50";

  if (!resource.file) {
    return (
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <ExternalLink className="h-3.5 w-3.5" /> Open
      </a>
    );
  }

  const file = resource.file;
  const opensInline = INLINE_TRAINING_TYPES.includes(file.contentType);
  return (
    <span className="flex flex-col">
      <button
        type="button"
        disabled={isOpening}
        title={file.name}
        onClick={async () => {
          setError(null);
          setIsOpening(true);
          try {
            await openTrainingFile(resource.id, file);
          } catch (err) {
            setError(errorMessage(err, "Couldn't open this file."));
          } finally {
            setIsOpening(false);
          }
        }}
        className={linkClass}
      >
        {opensInline ? <ExternalLink className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
        {isOpening ? "Opening..." : opensInline ? "Open" : "Download"}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-red-500">
          {error}
        </span>
      )}
    </span>
  );
}

type TrainingGridProps = {
  resources: ApiTrainingResource[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onEdit: (resource: ApiTrainingResource) => void;
  onTogglePublished: (resource: ApiTrainingResource) => void;
  onDelete: (resource: ApiTrainingResource) => void;
  /** Hides the publish/edit/delete controls on resources the viewer can't manage. Defaults to all. */
  canManage?: (resource: ApiTrainingResource) => boolean;
};

export function TrainingGrid({
  resources,
  isLoading,
  error,
  emptyMessage,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onEdit,
  onTogglePublished,
  onDelete,
  canManage = () => true,
}: TrainingGridProps) {
  if (isLoading) return <p className="text-sm text-gray-400">Loading training resources...</p>;
  if (error)
    return (
      <p role="alert" className="text-sm text-red-500">
        {error}
      </p>
    );
  if (resources.length === 0) return <p className="text-sm text-gray-400">{emptyMessage}</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => (
          <article key={resource.id} className={`flex flex-col rounded-xl border p-5 ${resource.published ? "border-gray-100" : "border-dashed border-gray-300 bg-gray-50/60"}`}>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeStyles[resource.type]}`}>
                {typeLabels[resource.type]}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{resource.category}</span>
              {!resource.published && (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">Draft</span>
              )}
            </div>
            <h2 className="text-sm font-bold text-gray-800">{resource.title}</h2>
            <p className="mt-1 line-clamp-3 flex-1 text-xs text-gray-500">{resource.description}</p>
            <p className="mt-3 text-[11px] text-gray-400">
              {resource.duration ? `${resource.duration} · ` : ""}
              {resource.pages ? `${resource.pages} ${resource.type === "ppt" ? "slides" : "pages"} · ` : ""}
              By {resource.authorName}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
              <ResourceOpenButton resource={resource} />
              {canManage(resource) ? (
                <span className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onTogglePublished(resource)}
                    title={resource.published ? "Unpublish" : "Publish"}
                    aria-label={`${resource.published ? "Unpublish" : "Publish"} "${resource.title}"`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {resource.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(resource)}
                    title="Edit"
                    aria-label={`Edit "${resource.title}"`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(resource)}
                    title="Delete"
                    aria-label={`Delete "${resource.title}"`}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <LoadMoreButton hasMore={hasMore} isLoadingMore={isLoadingMore} onClick={onLoadMore} shownCount={resources.length} />
    </div>
  );
}
