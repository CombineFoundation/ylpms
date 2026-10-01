"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { formatFileSize, openReportAttachment } from "@/lib/report-attachments";
import type { ReportAttachment } from "@/types/report.types";

/** Attached PDFs on a report; each opens in a new tab via the permission-checked API. */
export function ReportAttachments({ reportId, attachments }: { reportId: string; attachments: ReportAttachment[] }) {
  const [openingIndex, setOpeningIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (attachments.length === 0) return null;

  const open = async (index: number) => {
    setError(null);
    setOpeningIndex(index);
    try {
      await openReportAttachment(reportId, index);
    } catch (err) {
      setError(errorMessage(err, "Couldn't open this PDF."));
    } finally {
      setOpeningIndex(null);
    }
  };

  return (
    <section>
      <h3 className="mb-2 font-semibold text-gray-800">Attachments</h3>
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
        {attachments.map((attachment, index) => (
          <li key={attachment.path} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-red-500" />
              <span className="truncate text-gray-700">{attachment.name}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatFileSize(attachment.size)}</span>
            </span>
            <button
              type="button"
              onClick={() => open(index)}
              disabled={openingIndex === index}
              className="shrink-0 text-xs font-semibold text-brand hover:underline disabled:opacity-50"
            >
              {openingIndex === index ? "Opening..." : "Open PDF"}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </section>
  );
}
