"use client";

import { useRef, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { MAX_REPORT_ATTACHMENTS, formatFileSize, pdfFileError } from "@/lib/report-attachments";
import { FieldError } from "@/components/Head-of-RO/shared/ListParts";

type PdfAttachmentPickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
};

/** Pick up to MAX_REPORT_ATTACHMENTS PDFs (checked client-side; the server re-checks on upload). */
export function PdfAttachmentPicker({ files, onChange, disabled = false, label = "PDF attachments" }: PdfAttachmentPickerProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = (picked: FileList | null) => {
    if (!picked) return;
    setFileError(null);
    const next = [...files];
    for (const file of Array.from(picked)) {
      const problem = pdfFileError(file);
      if (problem) {
        setFileError(problem);
        continue;
      }
      if (next.length >= MAX_REPORT_ATTACHMENTS) {
        setFileError(`You can attach up to ${MAX_REPORT_ATTACHMENTS} PDFs.`);
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
        {label} <span className="font-normal text-gray-400">(optional, up to {MAX_REPORT_ATTACHMENTS}, 10 MB each)</span>
      </p>
      {files.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-red-500" />
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
      {files.length < MAX_REPORT_ATTACHMENTS && (
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-brand hover:text-brand">
          <Paperclip className="h-4 w-4" />
          {files.length ? "Add another PDF" : "Upload PDF"}
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,.pdf"
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
