"use client";

import { openAuthenticatedFile, uploadDirect } from "@/lib/report-attachments";
import { INLINE_TRAINING_TYPES, TRAINING_UPLOAD_RULES } from "@/utils/training-upload-rules";
import type { TrainingFile, TrainingResourceType } from "@/types/training.types";

/** The file input's `accept` for a resource type. */
export const acceptFor = (type: TrainingResourceType) =>
  TRAINING_UPLOAD_RULES[type].extensions.map((ext) => `.${ext}`).join(",");

export function uploadTrainingFile(file: File, type: TrainingResourceType): Promise<TrainingFile> {
  return uploadDirect<TrainingFile>(file, "/api/training/uploads", `?type=${type}`);
}

/** PDFs and videos open in a new tab; slides and Word documents download. */
export function openTrainingFile(resourceId: string, file: TrainingFile) {
  return openAuthenticatedFile(`/api/training/${resourceId}/file`, !INLINE_TRAINING_TYPES.includes(file.contentType));
}
