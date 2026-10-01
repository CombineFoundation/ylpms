"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FileText, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@/lib/zod-resolver";
import { acceptFor } from "@/lib/training-files";
import { formatFileSize } from "@/lib/report-attachments";
import { TRAINING_UPLOAD_RULES, formatMegabytes, trainingFileError } from "@/utils/training-upload-rules";
import { FieldError, inputClass } from "../shared/ListParts";
import {
  ALL_AUDIENCES,
  TRAINING_CATEGORIES,
  trainingFormSchema,
  typeLabels,
  type ApiTrainingResource,
  type TrainingForm,
} from "./training.types";

type TrainingFormModalProps = {
  isOpen: boolean;
  editing: ApiTrainingResource | null;
  error: string | null;
  /** e.g. "Uploading file..." while the parent uploads before saving. */
  progress?: string | null;
  onClose: () => void;
  /** `file` is the newly chosen upload (null keeps an existing uploaded file, or when using a link). */
  onSubmit: (values: TrainingForm, file: File | null) => Promise<void>;
};

const EMPTY_FORM: TrainingForm = {
  title: "",
  description: "",
  type: "video",
  category: "Leadership",
  source: "upload",
  url: "",
  duration: "",
  pages: "",
  // Published resources are visible to every role.
  audience: ALL_AUDIENCES,
  published: true,
};

const urlHints: Record<TrainingForm["type"], string> = {
  video: "YouTube/Vimeo link or embed URL.",
  pdf: "A shareable link to the PDF (e.g. Google Drive, Firebase Storage).",
  ppt: "A shareable link to the slides (Google Slides, OneDrive, Drive).",
  assignment: "A link to the assignment brief or submission form.",
};

export function TrainingFormModal({ isOpen, editing, error, progress, onClose, onSubmit }: TrainingFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TrainingForm>({ resolver: zodResolver(trainingFormSchema), defaultValues: EMPTY_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFile(null);
    setFileError(null);
    reset(
      editing
        ? {
            title: editing.title,
            description: editing.description,
            type: editing.type,
            category: editing.category,
            source: editing.file ? "upload" : "link",
            url: editing.url ?? "",
            duration: editing.duration || "",
            pages: editing.pages ? String(editing.pages) : "",
            audience: ALL_AUDIENCES,
            published: editing.published,
          }
        : EMPTY_FORM
    );
  }, [isOpen, editing, reset]);

  const type = watch("type");
  const source = watch("source");
  // An upload chosen for one type may not be allowed for another.
  const typeError = file ? trainingFileError(file, type) : null;
  const keepsExistingFile = source === "upload" && !file && !!editing?.file;

  const pickFile = (picked: File | undefined) => {
    setFileError(null);
    if (!picked) return;
    const problem = trainingFileError(picked, type);
    if (problem) {
      setFileError(problem);
      return;
    }
    setFile(picked);
  };

  const submit = handleSubmit(async (values) => {
    if (values.source === "upload") {
      if (!file && !editing?.file) return setFileError("Choose a file to upload");
      if (typeError) return setFileError(typeError);
    }
    await onSubmit(values, values.source === "upload" ? file : null);
  });

  return (
    <Modal
      isOpen={isOpen}
      title={editing ? "Edit Training Resource" : "Add Training Resource"}
      onClose={onClose}
      isBusy={isSubmitting}
      size="lg"
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block text-sm font-medium text-gray-700">
          Title
          <input {...register("title")} className={inputClass} aria-invalid={!!errors.title} />
          <FieldError message={errors.title?.message} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Description
          <textarea rows={3} {...register("description")} className={inputClass} aria-invalid={!!errors.description} />
          <FieldError message={errors.description?.message} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Type
            <select {...register("type")} className={inputClass}>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Category
            <select {...register("category")} className={inputClass}>
              {TRAINING_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-gray-700">Resource</legend>
          <div className="mt-1.5 flex gap-4 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input type="radio" value="upload" {...register("source")} className="accent-brand" />
              Upload a file
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="link" {...register("source")} className="accent-brand" />
              Link to it
            </label>
          </div>
        </fieldset>
        {source === "link" ? (
          <label className="block text-sm font-medium text-gray-700">
            Link
            <input type="url" placeholder="https://" {...register("url")} className={inputClass} aria-invalid={!!errors.url} />
            <span className="mt-1 block text-xs font-normal text-gray-400">{urlHints[type]}</span>
            <FieldError message={errors.url?.message} />
          </label>
        ) : (
          <div>
            {(file || editing?.file) && (
              <p className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                <FileText className="h-4 w-4 shrink-0 text-brand" />
                <span className="truncate text-gray-700">{file?.name ?? editing?.file?.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatFileSize(file?.size ?? editing?.file?.size ?? 0)}
                  {keepsExistingFile ? " · current file" : ""}
                </span>
              </p>
            )}
            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-brand hover:text-brand">
              <Upload className="h-4 w-4" />
              {file || editing?.file ? "Replace file" : "Choose file"}
              <input
                type="file"
                accept={acceptFor(type)}
                disabled={isSubmitting}
                onChange={(event) => {
                  pickFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
                className="sr-only"
              />
            </label>
            <span className="mt-1 block text-xs font-normal text-gray-400">
              {TRAINING_UPLOAD_RULES[type].extensions.map((ext) => `.${ext}`).join(", ")} · up to{" "}
              {formatMegabytes(TRAINING_UPLOAD_RULES[type].maxBytes)}
            </span>
            <FieldError message={fileError ?? typeError ?? undefined} />
          </div>
        )}
        {type === "video" ? (
          <label className="block text-sm font-medium text-gray-700">
            Duration (optional)
            <input placeholder="45:20" {...register("duration")} className={inputClass} aria-invalid={!!errors.duration} />
            <FieldError message={errors.duration?.message} />
          </label>
        ) : (
          type !== "assignment" && (
            <label className="block text-sm font-medium text-gray-700">
              {type === "ppt" ? "Slides" : "Pages"} (optional)
              <input type="number" min={1} {...register("pages")} className={inputClass} aria-invalid={!!errors.pages} />
              <FieldError message={errors.pages?.message} />
            </label>
          )
        )}
       <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="h-4 w-4 accent-brand" {...register("published")} />
          Published (drafts are only visible to you and Head ROs)
        </label>
        {progress && isSubmitting && <p className="text-sm text-gray-500">{progress}</p>}
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : editing ? "Save changes" : "Add Resource"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
