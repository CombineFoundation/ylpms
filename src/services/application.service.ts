import { randomInt } from "crypto";
import type { Application } from "@/types/application.types";
import { createDoc, docExists, queryDocs } from "@/utils/firestore";
import { ConflictError, logger } from "@/utils/errors";

const COLLECTION = "applications";

/** No 0/O or 1/I, so a reference read out over the phone can't be misheard. */
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function newReferenceNumber() {
  let code = "";
  for (let i = 0; i < 6; i++) code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `YLP-${code}`;
}

async function uniqueReferenceNumber() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = newReferenceNumber();
    if (!(await docExists(COLLECTION, reference))) return reference;
  }
  throw new Error("Couldn't allocate an application reference number");
}

/**
 * Saves a landing page application. Anyone can apply without signing in, so
 * there's no actor to write an activity log for; one application per email.
 */
export async function createApplication(input: { name: string; email: string; contact: string }) {
  const [existing] = await queryDocs<Application>(COLLECTION, [{ field: "email", operator: "==", value: input.email }]);
  if (existing) {
    throw new ConflictError(
      `An application with this email already exists (reference ${existing.referenceNumber}). Our team will be in touch.`
    );
  }

  const referenceNumber = await uniqueReferenceNumber();
  await createDoc(COLLECTION, referenceNumber, {
    referenceNumber,
    name: input.name,
    email: input.email,
    contact: input.contact,
    status: "new",
    source: "landing-page",
  });

  logger.info(`New YLP application ${referenceNumber}`);
  return { referenceNumber };
}
