import "server-only";

import { getFirebaseAdminBucket } from "@/lib/firebase-admin";
import { NotFoundError, ValidationError, logger } from "@/utils/errors";
import type { ReportAttachment } from "@/types/report.types";

/**
 * Report attachments - PDFs uploaded through the API (storage.rules deny all
 * browser access) and streamed back only to people allowed to view the report.
 */

export const MAX_REPORT_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_REPORT_ATTACHMENTS = 5;

const ownerPrefix = (ownerId: string) => `reports/${ownerId}/`;

function safeFileName(name: string) {
  const base = name.replace(/[\\/]/g, "_").replace(/[^\w.\- ()]/g, "").trim() || "report";
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

/** Validates and stores one PDF under the owner's folder. Nothing is linked to a report yet. */
export async function uploadReportPdf(file: File, ownerId: string): Promise<ReportAttachment> {
  if (file.size === 0) throw new ValidationError("The file is empty");
  if (file.size > MAX_REPORT_PDF_BYTES) throw new ValidationError("PDFs must be 10 MB or smaller");

  const bytes = Buffer.from(await file.arrayBuffer());
  // Check the real file signature, not just the name/content type the browser sent.
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new ValidationError("Only PDF files can be attached");
  }

  const name = safeFileName(file.name);
  const path = `${ownerPrefix(ownerId)}${crypto.randomUUID()}.pdf`;
  await getFirebaseAdminBucket()
    .file(path)
    .save(bytes, {
      contentType: "application/pdf",
      resumable: false,
      metadata: { contentDisposition: `inline; filename="${name}"`, metadata: { uploadedBy: ownerId } },
    });

  logger.info(`Report PDF uploaded: ${path} (${bytes.length} bytes)`);
  return { path, name, size: bytes.length };
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

export async function readReportAttachment(attachment: ReportAttachment): Promise<Buffer> {
  const file = getFirebaseAdminBucket().file(attachment.path);
  const [exists] = await file.exists();
  if (!exists) throw new NotFoundError("This attachment is no longer available");
  const [contents] = await file.download();
  return contents;
}
