"use client";

import { useRef, useState } from "react";
import { FileImage, FileText, Paperclip, X } from "lucide-react";
import { ATTACHMENT_ACCEPT, MAX_ATTACHMENTS, attachmentFileError, formatFileSize } from "@/lib/report-attachments";
import { isImageAttachment } from "@/utils/attachment-types";
import { FieldError } from "@/components/Head-of-RO/shared/ListParts";
import type { ReportAttachment } from "@/types/report.types";

function FileIcon({ name }: { name: string }) {
  return isImageAttachment(name) ? (
    <FileImage className="h-4 w-4 shrink-0 text-sky-500" />
  ) : (
    <FileText className="h-4 w-4 shrink-0 text-red-500" />
  );
}

type PdfAttachmentPickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
  /** How many new files may be picked; less than the limit when some are already attached. */
  maxFiles?: number;
};

/** Pick up to MAX_ATTACHMENTS PDFs or images (checked client-side; the server re-checks on upload). */
export function PdfAttachmentPicker({
  files,
  onChange,
  disabled = false,
  label = "Attachments",
  maxFiles = MAX_ATTACHMENTS,
}: PdfAttachmentPickerProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = (picked: FileList | null) => {
    if (!picked) return;
    setFileError(null);
    const next = [...files];
    for (const file of Array.from(picked)) {
      const problem = attachmentFileError(file);
      if (problem) {
        setFileError(problem);
        continue;
      }
      if (next.length >= maxFiles) {
        setFileError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
        break;
      }
      if (!next.some((existing) => existing.name === file.name && existing.size === file.size)) next.push(file);
    }
    onChange(next);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700">
        {label} <span className="font-normal text-gray-400">(optional, up to {MAX_ATTACHMENTS}, 10 MB each)</span>
      </p>
      {files.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <FileIcon name={file.name} />
                <span className="truncate text-gray-700">{file.name}</span>
                <span className="shrink-0 text-xs text-gray-400">{formatFileSize(file.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                className="text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length < maxFiles && (
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-brand hover:text-brand">
          <Paperclip className="h-4 w-4" />
          {files.length ? "Add another file" : "Upload PDF or photo"}
          <input
            ref={fileInput}
            type="file"
            accept={ATTACHMENT_ACCEPT}
            multiple
            disabled={disabled}
            onChange={(event) => addFiles(event.target.files)}
            className="sr-only"
          />
        </label>
      )}
      <FieldError message={fileError ?? undefined} />
    </div>
  );
}

type AttachedPdfListProps = {
  attachments: ReportAttachment[];
  onChange: (attachments: ReportAttachment[]) => void;
  disabled?: boolean;
};

/** Files already on an earlier submission that is being resubmitted; each stays attached unless removed. */
export function AttachedPdfList({ attachments, onChange, disabled = false }: AttachedPdfListProps) {
  if (attachments.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">Already attached</p>
      <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100">
        {attachments.map((attachment) => (
          <li key={attachment.path} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <FileIcon name={attachment.name} />
              <span className="truncate text-gray-700">{attachment.name}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatFileSize(attachment.size)}</span>
            </span>
            <button
              type="button"
              onClick={() => onChange(attachments.filter((item) => item.path !== attachment.path))}
              disabled={disabled}
              aria-label={`Remove ${attachment.name}`}
              className="text-gray-400 hover:text-red-500 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The reviewer's feedback on what's being resubmitted, shown at the top of the form. */
export function ReviewerFeedback({ title, message }: { title: string; message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
      <p className="mt-1 whitespace-pre-line">{message}</p>
    </div>
  );
}
