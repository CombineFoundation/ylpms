import "server-only";

import { getFirebaseAdminBucket } from "@/lib/firebase-admin";
import { ValidationError, logger } from "@/utils/errors";
import { INLINE_TRAINING_TYPES, TRAINING_UPLOAD_RULES, fileExtension, trainingFileError } from "@/utils/training-upload-rules";
import { acceptUpload, createDownloadUrl, createUploadTicket, type UploadTicket } from "./direct-upload.service";
import type { TrainingFile, TrainingResourceType } from "@/types/training.types";

/**
 * Training files - uploaded straight to Storage with a signed URL, checked and
 * filed under the uploader's folder, and opened through short-lived links by
 * anyone who can see the resource.
 */

type FileKind = { ext: string; contentType: string; matches: (bytes: Buffer) => boolean };

const startsWith = (signature: number[]) => (bytes: Buffer) => signature.every((byte, index) => bytes[index] === byte);
const isPdf = startsWith([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
const isZip = startsWith([0x50, 0x4b, 0x03, 0x04]); // .pptx / .docx
const isOle = startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // .ppt / .doc
const isMp4 = (bytes: Buffer) => bytes.subarray(4, 8).toString("latin1") === "ftyp";
const isWebm = startsWith([0x1a, 0x45, 0xdf, 0xa3]);

const KINDS: Record<string, FileKind> = {
  pdf: { ext: "pdf", contentType: "application/pdf", matches: isPdf },
  ppt: { ext: "ppt", contentType: "application/vnd.ms-powerpoint", matches: isOle },
  pptx: { ext: "pptx", contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", matches: isZip },
  doc: { ext: "doc", contentType: "application/msword", matches: isOle },
  docx: { ext: "docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", matches: isZip },
  mp4: { ext: "mp4", contentType: "video/mp4", matches: isMp4 },
  webm: { ext: "webm", contentType: "video/webm", matches: isWebm },
};

const ownerPrefix = (ownerId: string) => `training/${ownerId}/`;

function safeFileName(name: string) {
  return name.replace(/[\\/]/g, "_").replace(/[^\w.\- ()]/g, "").trim() || "training-file";
}

function kindFor(name: string, size: number, type: TrainingResourceType): FileKind {
  const problem = trainingFileError({ name, size }, type);
  if (problem) throw new ValidationError(problem);
  return KINDS[fileExtension(name)];
}

/** Step 1: a signed URL to upload one training file (extension and size checked first). */
export async function createTrainingFileUpload(
  file: { name: string; size: number },
  type: TrainingResourceType,
  ownerId: string
): Promise<UploadTicket> {
  const kind = kindFor(file.name, file.size, type);
  return createUploadTicket(ownerId, kind.contentType, TRAINING_UPLOAD_RULES[type].maxBytes);
}

/** Step 2: checks the uploaded file (size and the real file signature) and files it under the owner's folder. */
export async function confirmTrainingFileUpload(
  uploadPath: string,
  fileName: string,
  type: TrainingResourceType,
  ownerId: string
): Promise<TrainingFile> {
  const kind = kindFor(fileName, 1, type);
  const name = safeFileName(fileName);
  const path = `${ownerPrefix(ownerId)}${crypto.randomUUID()}.${kind.ext}`;
  const size = await acceptUpload({
    uploadPath,
    ownerId,
    finalPath: path,
    contentType: kind.contentType,
    fileName: name,
    headBytes: 8,
    check: (bytes, head) =>
      trainingFileError({ name: fileName, size: bytes }, type) ??
      (kind.matches(head) ? null : `"${fileName}" doesn't look like a valid .${kind.ext} file`),
  });
  return { path, name, size, contentType: kind.contentType };
}

/** A resource may only point at a file its author uploaded that actually exists. */
export async function requireOwnTrainingFile(file: TrainingFile, ownerId: string): Promise<void> {
  if (!file.path.startsWith(ownerPrefix(ownerId)) || file.path.includes("..")) {
    throw new ValidationError(`"${file.name}" wasn't uploaded by this account`);
  }
  const [exists] = await getFirebaseAdminBucket().file(file.path).exists();
  if (!exists) throw new ValidationError(`"${file.name}" couldn't be found — please upload it again`);
}

/** A short-lived link: PDFs and videos open in the browser; slides and Word documents download. */
export function trainingFileUrl(file: TrainingFile): Promise<string> {
  const disposition = INLINE_TRAINING_TYPES.includes(file.contentType) ? "inline" : "attachment";
  return createDownloadUrl(file.path, file.name, file.contentType, disposition);
}

/** Best-effort cleanup when a resource's file is replaced or the resource is deleted. */
export async function deleteTrainingFile(file: TrainingFile): Promise<void> {
  try {
    await getFirebaseAdminBucket().file(file.path).delete({ ignoreNotFound: true });
  } catch (error) {
    logger.error(`Failed to delete training file ${file.path}`, error);
  }
}
