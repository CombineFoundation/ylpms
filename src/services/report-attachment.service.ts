import "server-only";

import { getFirebaseAdminBucket } from "@/lib/firebase-admin";
import { NotFoundError, ValidationError } from "@/utils/errors";
import { acceptUpload, createDownloadUrl, createUploadTicket, type UploadTicket } from "./direct-upload.service";
import type { ReportAttachment } from "@/types/report.types";

/**
 * Report attachments - PDFs (for reports, task submissions and activity
 * evidence) uploaded straight to Storage with a signed URL, checked, and
 * opened through short-lived links given only to people allowed to see them.
 */

export const MAX_REPORT_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_REPORT_ATTACHMENTS = 5;

const PDF = "application/pdf";
const ownerPrefix = (ownerId: string) => `reports/${ownerId}/`;

function safeFileName(name: string) {
  const base = name.replace(/[\\/]/g, "_").replace(/[^\w.\- ()]/g, "").trim() || "report";
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

/** Step 1: a signed URL to upload one PDF into the owner's incoming folder. */
export async function createReportPdfUpload(file: { name: string; size: number }, ownerId: string): Promise<UploadTicket> {
  if (file.size > MAX_REPORT_PDF_BYTES) throw new ValidationError("PDFs must be 10 MB or smaller");
  return createUploadTicket(ownerId, PDF, MAX_REPORT_PDF_BYTES);
}

/** Step 2: checks the uploaded PDF and files it under the owner's folder. Nothing is linked to a report yet. */
export async function confirmReportPdfUpload(uploadPath: string, fileName: string, ownerId: string): Promise<ReportAttachment> {
  const name = safeFileName(fileName);
  const path = `${ownerPrefix(ownerId)}${crypto.randomUUID()}.pdf`;
  const size = await acceptUpload({
    uploadPath,
    ownerId,
    finalPath: path,
    contentType: PDF,
    fileName: name,
    headBytes: 5,
    // Check the real file signature, not just the name/content type the browser sent.
    check: (bytes, head) =>
      bytes === 0
        ? "The file is empty"
        : bytes > MAX_REPORT_PDF_BYTES
          ? "PDFs must be 10 MB or smaller"
          : head.toString("latin1") !== "%PDF-"
            ? "Only PDF files can be attached"
            : null,
  });
  return { path, name, size };
}

/**
 * Attachments on a new report must be files this submitter uploaded (their
 * folder) that actually exist, so a report can't point at someone else's PDF.
 */
export async function requireOwnAttachments(attachments: ReportAttachment[], submitterId: string): Promise<void> {
  if (attachments.length > MAX_REPORT_ATTACHMENTS) {
    throw new ValidationError(`Attach at most ${MAX_REPORT_ATTACHMENTS} PDFs`);
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
 * short-lived link that opens the PDF.
 */
export async function reportAttachmentUrl(attachment: ReportAttachment, ownerId: string): Promise<string> {
  if (!attachment.path.startsWith(ownerPrefix(ownerId)) || attachment.path.includes("..")) {
    throw new NotFoundError("Attachment not found");
  }
  return createDownloadUrl(attachment.path, attachment.name, PDF);
}
