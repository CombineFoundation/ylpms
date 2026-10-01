"use client";

import { ApiError, getAuthToken } from "@/lib/api-client";
import { openAuthenticatedFile } from "@/lib/report-attachments";
import { INLINE_TRAINING_TYPES, TRAINING_UPLOAD_RULES } from "@/utils/training-upload-rules";
import type { TrainingFile, TrainingResourceType } from "@/types/training.types";

/** The file input's `accept` for a resource type. */
export const acceptFor = (type: TrainingResourceType) =>
  TRAINING_UPLOAD_RULES[type].extensions.map((ext) => `.${ext}`).join(",");

export async function uploadTrainingFile(file: File, type: TrainingResourceType): Promise<TrainingFile> {
  const token = await getAuthToken();
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`/api/training/uploads?type=${type}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(result.error?.message || `Couldn't upload "${file.name}".`, response.status, result.error?.code);
  }
  return result.data as TrainingFile;
}

/** PDFs and videos open in a new tab; slides and Word documents download. */
export function openTrainingFile(resourceId: string, file: TrainingFile) {
  const path = `/api/training/${resourceId}/file`;
  return INLINE_TRAINING_TYPES.includes(file.contentType) ? openAuthenticatedFile(path) : openAuthenticatedFile(path, file.name);
}
