import "server-only";

import { getFirebaseAdminBucket } from "@/lib/firebase-admin";
import { NotFoundError, ValidationError, logger } from "@/utils/errors";
import { fileExtension, trainingFileError } from "@/utils/training-upload-rules";
import type { TrainingFile, TrainingResourceType } from "@/types/training.types";

/**
 * Training files - uploaded through the API (storage.rules deny all browser
 * access) into the uploader's folder, and streamed back to anyone who can see
 * the resource.
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

/** Validates (extension, size and the real file signature) and stores one training file. */
export async function uploadTrainingFile(file: File, type: TrainingResourceType, ownerId: string): Promise<TrainingFile> {
  const problem = trainingFileError(file, type);
  if (problem) throw new ValidationError(problem);
  const ext = fileExtension(file.name);
  const kind = KINDS[ext];

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!kind.matches(bytes)) throw new ValidationError(`"${file.name}" doesn't look like a valid .${ext} file`);

  const name = safeFileName(file.name);
  const path = `${ownerPrefix(ownerId)}${crypto.randomUUID()}.${kind.ext}`;
  await getFirebaseAdminBucket()
    .file(path)
    .save(bytes, {
      contentType: kind.contentType,
      resumable: false,
      metadata: { contentDisposition: `inline; filename="${name}"`, metadata: { uploadedBy: ownerId } },
    });

  logger.info(`Training file uploaded: ${path} (${bytes.length} bytes)`);
  return { path, name, size: bytes.length, contentType: kind.contentType };
}

/** A resource may only point at a file its author uploaded that actually exists. */
export async function requireOwnTrainingFile(file: TrainingFile, ownerId: string): Promise<void> {
  if (!file.path.startsWith(ownerPrefix(ownerId)) || file.path.includes("..")) {
    throw new ValidationError(`"${file.name}" wasn't uploaded by this account`);
  }
  const [exists] = await getFirebaseAdminBucket().file(file.path).exists();
  if (!exists) throw new ValidationError(`"${file.name}" couldn't be found — please upload it again`);
}

export async function readTrainingFile(file: TrainingFile): Promise<Buffer> {
  const stored = getFirebaseAdminBucket().file(file.path);
  const [exists] = await stored.exists();
  if (!exists) throw new NotFoundError("This file is no longer available");
  const [contents] = await stored.download();
  return contents;
}

/** Best-effort cleanup when a resource's file is replaced or the resource is deleted. */
export async function deleteTrainingFile(file: TrainingFile): Promise<void> {
  try {
    await getFirebaseAdminBucket().file(file.path).delete({ ignoreNotFound: true });
  } catch (error) {
    logger.error(`Failed to delete training file ${file.path}`, error);
  }
}
