"use client";

import { ApiError, apiFetch } from "@/lib/api-client";
import { SCOPE_PARAM, type ScopedRole } from "@/utils/portal-scope";
import { MAX_ATTACHMENT_BYTES, attachmentKindFor } from "@/utils/attachment-types";
import type { ReportAttachment } from "@/types/report.types";

export { ATTACHMENT_ACCEPT, MAX_ATTACHMENTS } from "@/utils/attachment-types";

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Client-side check before uploading; the server re-checks (including the file's real signature). */
export function attachmentFileError(file: File): string | null {
  if (!attachmentKindFor(file.name)) return `"${file.name}" isn't a PDF or an image (JPG, PNG, WEBP)`;
  if (file.size > MAX_ATTACHMENT_BYTES) return `"${file.name}" is larger than 10 MB`;
  if (file.size === 0) return `"${file.name}" is empty`;
  return null;
}

type UploadTicket = { uploadUrl: string; uploadPath: string; headers: Record<string, string> };

/**
 * Uploads one file straight to Storage, so large files don't pass through our
 * API: `${apiPath}/upload-url` signs the upload, the file is PUT there, then
 * `apiPath` checks it and returns what to attach. `query` is appended to both.
 */
export async function uploadDirect<T>(file: File, apiPath: string, query = ""): Promise<T> {
  const ticket = await apiFetch<UploadTicket>(`${apiPath}/upload-url${query}`, {
    method: "POST",
    body: { name: file.name, size: file.size },
  });
  const response = await fetch(ticket.uploadUrl, { method: "PUT", headers: ticket.headers, body: file }).catch(() => null);
  if (!response?.ok) {
    throw new ApiError(`Couldn't upload "${file.name}". Check your connection and try again.`, response?.status ?? 0);
  }
  return apiFetch<T>(`${apiPath}${query}`, { method: "POST", body: { uploadPath: ticket.uploadPath, name: file.name } });
}

/**
 * Uploads one PDF or image (for a report, a task submission or an activity's evidence);
 * `actingAs` is set when a developer is acting as that portal's user.
 */
export function uploadReportPdf(
  file: File,
  actingAs: { role: ScopedRole; id: string } | null = null
): Promise<ReportAttachment> {
  const query = actingAs ? `?${SCOPE_PARAM[actingAs.role]}=${encodeURIComponent(actingAs.id)}` : "";
  return uploadDirect<ReportAttachment>(file, "/api/reports/attachments", query);
}

/** Opens a report's attachment in a new tab. */
export function openReportAttachment(reportId: string, index: number) {
  return openAuthenticatedPdf(`/api/reports/${reportId}/attachments/${index}`);
}

/** Opens an attachment (PDF or image) whose link our API gives, in a new tab. */
export function openAuthenticatedPdf(path: string) {
  return openAuthenticatedFile(path);
}

/**
 * Opens a file whose short-lived link our API gives at `path`. It opens in a
 * new tab (opened synchronously, inside the click, so popup blockers allow it,
 * then pointed at the link); with `download` the link saves the file instead,
 * so no tab is needed.
 */
export async function openAuthenticatedFile(path: string, download = false) {
  const tab = download ? null : window.open("", "_blank");
  try {
    const { url } = await apiFetch<{ url: string }>(path);
    if (tab) tab.location.href = url;
    else window.location.href = url;
  } catch (error) {
    tab?.close();
    throw error;
  }
}
