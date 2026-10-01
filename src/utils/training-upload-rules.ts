import type { TrainingResourceType } from "@/types/training.types";

const MB = 1024 * 1024;

/**
 * Which file extensions each training resource type accepts, and how large
 * they may be. Shared by the upload form (instant feedback) and the server
 * (the real check), so it must stay free of server-only imports.
 */
export const TRAINING_UPLOAD_RULES: Record<TrainingResourceType, { extensions: string[]; maxBytes: number }> = {
  video: { extensions: ["mp4", "webm"], maxBytes: 100 * MB },
  pdf: { extensions: ["pdf"], maxBytes: 25 * MB },
  ppt: { extensions: ["ppt", "pptx", "pdf"], maxBytes: 25 * MB },
  assignment: { extensions: ["pdf", "doc", "docx"], maxBytes: 25 * MB },
};

/** Types browsers can show directly; anything else (slides, Word documents) downloads. */
export const INLINE_TRAINING_TYPES = ["application/pdf", "video/mp4", "video/webm"];

export const fileExtension = (name: string) => name.toLowerCase().split(".").pop() ?? "";

export const formatMegabytes = (bytes: number) => `${Math.round(bytes / MB)} MB`;

/** Why this file can't be uploaded for `type`, or null if it can. */
export function trainingFileError(file: { name: string; size: number }, type: TrainingResourceType): string | null {
  const rules = TRAINING_UPLOAD_RULES[type];
  if (!rules.extensions.includes(fileExtension(file.name))) {
    return `For this type, upload a ${rules.extensions.map((ext) => `.${ext}`).join(", ")} file`;
  }
  if (file.size === 0) return `"${file.name}" is empty`;
  if (file.size > rules.maxBytes) return `Files must be ${formatMegabytes(rules.maxBytes)} or smaller`;
  return null;
}
