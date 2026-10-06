/**
 * File types accepted as attachments on reports, task submissions and
 * activity evidence: PDFs plus phone-friendly images (photos, screenshots).
 * Shared by the upload picker (instant feedback) and the server (the real
 * check, which also reads the file's signature), so keep it import-free.
 */

export type AttachmentKind = { ext: string; contentType: string; label: string };

export const ATTACHMENT_KINDS: Record<string, AttachmentKind> = {
  pdf: { ext: "pdf", contentType: "application/pdf", label: "PDF" },
  jpg: { ext: "jpg", contentType: "image/jpeg", label: "image" },
  jpeg: { ext: "jpg", contentType: "image/jpeg", label: "image" },
  png: { ext: "png", contentType: "image/png", label: "image" },
  webp: { ext: "webp", contentType: "image/webp", label: "image" },
};

/** For a file input's `accept`. */
export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;

const extensionOf = (name: string) => name.toLowerCase().split(".").pop() ?? "";

/** The kind a file name (or stored path) is, or null if it isn't accepted. */
export const attachmentKindFor = (name: string): AttachmentKind | null => ATTACHMENT_KINDS[extensionOf(name)] ?? null;

export const isImageAttachment = (name: string) => attachmentKindFor(name)?.contentType.startsWith("image/") ?? false;
