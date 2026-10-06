import "server-only";

import { getFirebaseAdminBucket } from "@/lib/firebase-admin";
import { NotFoundError, ValidationError } from "@/utils/errors";
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, attachmentKindFor, type AttachmentKind } from "@/utils/attachment-types";
import { acceptUpload, createDownloadUrl, createUploadTicket, type UploadTicket } from "./direct-upload.service";
import type { ReportAttachment } from "@/types/report.types";

/**
 * Attachments on reports, task submissions and activity evidence - PDFs and
 * images (see utils/attachment-types.ts) uploaded straight to Storage with a
 * signed URL, checked, and opened through short-lived links given only to
 * people allowed to see them.
 */

const ownerPrefix = (ownerId: string) => `reports/${ownerId}/`;
const TOO_LARGE = "Files must be 10 MB or smaller";
const NOT_ACCEPTED = "Attach a PDF or an image (JPG, PNG or WEBP)";

const startsWith = (head: Buffer, signature: number[]) => signature.every((byte, index) => head[index] === byte);

/** The file's real signature, not just the name/content type the browser sent. */
function matchesKind(kind: AttachmentKind, head: Buffer): boolean {
  switch (kind.ext) {
    case "pdf":
      return head.subarray(0, 5).toString("latin1") === "%PDF-";
    case "jpg":
      return startsWith(head, [0xff, 0xd8, 0xff]);
    case "png":
      return startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "webp":
      return head.subarray(0, 4).toString("latin1") === "RIFF" && head.subarray(8, 12).toString("latin1") === "WEBP";
    default:
      return false;
  }
}

function requireKind(fileName: string): AttachmentKind {
  const kind = attachmentKindFor(fileName);
  if (!kind) throw new ValidationError(NOT_ACCEPTED);
  return kind;
}

function safeFileName(name: string, kind: AttachmentKind) {
  const base = name.replace(/[\\/]/g, "_").replace(/[^\w.\- ()]/g, "").trim() || "attachment";
  return attachmentKindFor(base) ? base : `${base}.${kind.ext}`;
}

/** Step 1: a signed URL to upload one PDF or image into the owner's incoming folder. */
export async function createAttachmentUpload(file: { name: string; size: number }, ownerId: string): Promise<UploadTicket> {
  const kind = requireKind(file.name);
  if (file.size > MAX_ATTACHMENT_BYTES) throw new ValidationError(TOO_LARGE);
  return createUploadTicket(ownerId, kind.contentType, MAX_ATTACHMENT_BYTES);
}

/** Step 2: checks the uploaded file and files it under the owner's folder. Nothing is linked to anything yet. */
export async function confirmAttachmentUpload(uploadPath: string, fileName: string, ownerId: string): Promise<ReportAttachment> {
  const kind = requireKind(fileName);
  const name = safeFileName(fileName, kind);
  const path = `${ownerPrefix(ownerId)}${crypto.randomUUID()}.${kind.ext}`;
  const size = await acceptUpload({
    uploadPath,
    ownerId,
    finalPath: path,
    contentType: kind.contentType,
    fileName: name,
    headBytes: 12,
    check: (bytes, head) =>
      bytes === 0
        ? "The file is empty"
        : bytes > MAX_ATTACHMENT_BYTES
          ? TOO_LARGE
          : matchesKind(kind, head)
            ? null
            : `"${fileName}" doesn't look like a valid ${kind.label} — ${NOT_ACCEPTED.toLowerCase()}`,
  });
  return { path, name, size };
}

/**
 * Attachments on a new report must be files this submitter uploaded (their
 * folder) that actually exist, so a report can't point at someone else's file.
 */
export async function requireOwnAttachments(attachments: ReportAttachment[], submitterId: string): Promise<void> {
  if (attachments.length > MAX_ATTACHMENTS) {
    throw new ValidationError(`Attach at most ${MAX_ATTACHMENTS} files`);
  }
  const bucket = getFirebaseAdminBucket();
  for (const attachment of attachments) {
    if (!attachment.path.startsWith(ownerPrefix(submitterId)) || attachment.path.includes("..")) {
      throw new ValidationError(`"${attachment.name}" wasn't uploaded by this account`);
    }
    const [exists] = await bucket.file(attachment.path).exists();
    if (!exists) throw new ValidationError(`"${attachment.name}" couldn't be found — please upload it again`);
  }
}

/**
 * `ownerId` is who the attachment must have been uploaded by (the report's
 * submitter, the task's assignee or the activity's organizer), so a doc that
 * was tampered with can't be used to read someone else's file. Returns a
 * short-lived link that opens the file in the browser.
 */
export async function reportAttachmentUrl(attachment: ReportAttachment, ownerId: string): Promise<string> {
  if (!attachment.path.startsWith(ownerPrefix(ownerId)) || attachment.path.includes("..")) {
    throw new NotFoundError("Attachment not found");
  }
  // Older attachments are all PDFs; the stored path's extension gives the type.
  const contentType = attachmentKindFor(attachment.path)?.contentType ?? "application/pdf";
  return createDownloadUrl(attachment.path, attachment.name, contentType);
}
