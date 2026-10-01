"use client";

import { ApiError, getAuthToken } from "@/lib/api-client";
import { SCOPE_PARAM, type ScopedRole } from "@/utils/portal-scope";
import type { ReportAttachment } from "@/types/report.types";

export const MAX_REPORT_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_REPORT_ATTACHMENTS = 5;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Client-side check before uploading; the server re-checks (including the real PDF signature). */
export function pdfFileError(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return `"${file.name}" isn't a PDF`;
  if (file.size > MAX_REPORT_PDF_BYTES) return `"${file.name}" is larger than 10 MB`;
  if (file.size === 0) return `"${file.name}" is empty`;
  return null;
}

/**
 * Uploads one PDF (for a report, or an activity's evidence); `actingAs` is set
 * when a developer is acting as that portal's user.
 */
export async function uploadReportPdf(
  file: File,
  actingAs: { role: ScopedRole; id: string } | null = null
): Promise<ReportAttachment> {
  const token = await getAuthToken();
  const body = new FormData();
  body.append("file", file);
  const query = actingAs ? `?${SCOPE_PARAM[actingAs.role]}=${encodeURIComponent(actingAs.id)}` : "";
  const response = await fetch(`/api/reports/attachments${query}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(result.error?.message || `Couldn't upload "${file.name}".`, response.status, result.error?.code);
  }
  return result.data as ReportAttachment;
}

/** Opens an attached report PDF in a new tab. */
export function openReportAttachment(reportId: string, index: number) {
  return openAuthenticatedPdf(`/api/reports/${reportId}/attachments/${index}`);
}

/** Opens a PDF served by our API in a new tab. */
export function openAuthenticatedPdf(path: string) {
  return openAuthenticatedFile(path);
}

/**
 * Opens a file served by our API. Without `downloadName` it opens in a new tab
 * (opened synchronously, inside the click, so popup blockers allow it, then
 * pointed at the downloaded file); with one it's saved under that name instead.
 */
export async function openAuthenticatedFile(path: string, downloadName?: string) {
  const tab = downloadName ? null : window.open("", "_blank");
  try {
    const token = await getAuthToken();
    const response = await fetch(path, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error?.message || "Couldn't open this file.");
    }
    const url = URL.createObjectURL(await response.blob());
    if (downloadName) {
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else if (tab) tab.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    tab?.close();
    throw error;
  }
}
