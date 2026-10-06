import "server-only";

import { getFirebaseAdminBucket } from "@/lib/firebase-admin";
import { NotFoundError, ValidationError, logger } from "@/utils/errors";

/**
 * Files go between the browser and Storage directly through short-lived signed
 * URLs, so they never pass through our API (Vercel caps request and response
 * bodies at ~4.5 MB). storage.rules still deny all other browser access.
 *
 * Upload: the API signs a PUT into the caller's `incoming/{ownerId}/` folder;
 * the browser uploads there; the API then checks the file (size, real file
 * signature) and moves it into its final folder. Only files in a final folder
 * can be attached to anything, so an unchecked upload is never used.
 *
 * Bucket CORS must allow PUT from the site (see storage.cors.json).
 */

const UPLOAD_URL_TTL_MS = 15 * 60 * 1000;
const DOWNLOAD_URL_TTL_MS = 5 * 60 * 1000;
const SIZE_HEADER = "x-goog-content-length-range";

export type UploadTicket = {
  uploadUrl: string;
  uploadPath: string;
  /** Must be sent as-is with the PUT; the URL's signature covers them. */
  headers: Record<string, string>;
};

const incomingPrefix = (ownerId: string) => `incoming/${ownerId}/`;

/** Signs a PUT for one file of `contentType`, up to `maxBytes` (Storage rejects anything larger). */
export async function createUploadTicket(ownerId: string, contentType: string, maxBytes: number): Promise<UploadTicket> {
  const uploadPath = `${incomingPrefix(ownerId)}${crypto.randomUUID()}`;
  const sizeRange = `1,${maxBytes}`;
  const [uploadUrl] = await getFirebaseAdminBucket()
    .file(uploadPath)
    .getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + UPLOAD_URL_TTL_MS,
      contentType,
      extensionHeaders: { [SIZE_HEADER]: sizeRange },
    });
  return { uploadUrl, uploadPath, headers: { "Content-Type": contentType, [SIZE_HEADER]: sizeRange } };
}

/**
 * Checks an upload made with a ticket and moves it to `finalPath`. `check` gets
 * the file's size and its first `headBytes` bytes and returns a problem, or null.
 * A file that fails the check is deleted.
 */
export async function acceptUpload(options: {
  uploadPath: string;
  ownerId: string;
  finalPath: string;
  contentType: string;
  fileName: string;
  headBytes: number;
  check: (size: number, head: Buffer) => string | null;
}): Promise<number> {
  const { uploadPath, ownerId, finalPath, contentType, fileName, headBytes, check } = options;
  if (!uploadPath.startsWith(incomingPrefix(ownerId)) || uploadPath.includes("..")) {
    throw new ValidationError(`"${fileName}" wasn't uploaded by this account`);
  }

  const file = getFirebaseAdminBucket().file(uploadPath);
  const [exists] = await file.exists();
  if (!exists) throw new ValidationError(`"${fileName}" didn't finish uploading — please try again`);

  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size ?? 0);
  const head = size > 0 ? (await file.download({ start: 0, end: Math.min(headBytes, size) - 1 }))[0] : Buffer.alloc(0);
  const problem = check(size, head);
  if (problem) {
    await discardUpload(uploadPath);
    throw new ValidationError(problem);
  }

  const destination = getFirebaseAdminBucket().file(finalPath);
  await file.move(destination);
  await destination.setMetadata({
    contentType,
    contentDisposition: `inline; filename="${fileName}"`,
    metadata: { uploadedBy: ownerId },
  });
  logger.info(`Upload accepted: ${finalPath} (${size} bytes)`);
  return size;
}

async function discardUpload(path: string) {
  try {
    await getFirebaseAdminBucket().file(path).delete({ ignoreNotFound: true });
  } catch (error) {
    logger.error(`Failed to delete rejected upload ${path}`, error);
  }
}

/** A short-lived link that opens (`inline`) or saves (`attachment`) a stored file. */
export async function createDownloadUrl(
  path: string,
  fileName: string,
  contentType: string,
  disposition: "inline" | "attachment" = "inline"
): Promise<string> {
  const file = getFirebaseAdminBucket().file(path);
  const [exists] = await file.exists();
  if (!exists) throw new NotFoundError("This file is no longer available");
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + DOWNLOAD_URL_TTL_MS,
    responseType: contentType,
    responseDisposition: `${disposition}; filename="${fileName.replace(/"/g, "")}"`,
  });
  return url;
}
