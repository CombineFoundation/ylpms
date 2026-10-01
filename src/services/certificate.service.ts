import { batchWrite, getDocById, getDocsByIds, queryDocs } from "@/utils/firestore";
import { toDate } from "@/utils/aggregation";
import { canAccessUserInChain } from "@/utils/authorization";
import { AuthorizationError, NotFoundError, logger } from "@/utils/errors";
import { createActivityLog } from "./activitylog.service";
import { notifyUsers } from "./notification.service";
import type { Certificate, CertificateKind } from "@/types/certificate.types";
import type { Event } from "@/types/event.types";
import type { User, UserRole } from "@/types/user.types";

/**
 * Certificate Service - participation certificates, issued when an activity's
 * evidence is verified (the last step of the activity workflow).
 */

const COLLECTION = "certificates";

const CERTIFICATES_ROUTE_BY_ROLE: Partial<Record<UserRole, string>> = {
  "youth-leader": "/youth-leader/certificates",
  volunteer: "/volunteer/certificates",
};

const titles: Record<CertificateKind, string> = {
  participation: "Certificate of Participation",
  organizer: "Certificate of Leadership",
};

/** Deterministic id, so verifying twice can't issue duplicates. */
const certificateId = (eventId: string, userId: string) => `${eventId}_${userId}`;

function certificateNumber(issuedAt: Date) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `YLP-${issuedAt.getFullYear()}-${suffix}`;
}

/**
 * Issues certificates for a verified event: a participation certificate for
 * every participant and a leadership certificate for each organizer. Users who
 * already hold one for this event are skipped. Returns how many were issued.
 */
export async function issueEventCertificates(event: Event, issuedById: string): Promise<number> {
  const participantIds = event.evidence?.participantIds ?? [];
  const kindByUser = new Map<string, CertificateKind>();
  participantIds.forEach((id) => kindByUser.set(id, "participation"));
  event.organizerIds.forEach((id) => kindByUser.set(id, "organizer"));

  const userIds = [...kindByUser.keys()];
  const [recipients, existing, issuer] = await Promise.all([
    getDocsByIds<User>("users", userIds),
    getDocsByIds<Certificate>(COLLECTION, userIds.map((id) => certificateId(event.id, id))),
    getDocById<User>("users", issuedById),
  ]);
  const alreadyIssued = new Set(existing.map((certificate) => certificate.userId));
  const issuedAt = new Date();

  const newCertificates = recipients
    .filter((recipient) => !alreadyIssued.has(recipient.id))
    .map((recipient) => {
      const kind = kindByUser.get(recipient.id)!;
      const certificate: Omit<Certificate, "id" | "createdAt" | "updatedAt"> = {
        userId: recipient.id,
        recipientName: recipient.name,
        recipientRole: recipient.role,
        kind,
        title: titles[kind],
        eventId: event.id,
        eventTitle: event.title,
        eventLocation: event.location,
        eventDate: toDate(event.startDate) ?? issuedAt,
        certificateNumber: certificateNumber(issuedAt),
        issuedBy: issuedById,
        issuedByName: issuer?.name || "Combine Foundation",
        issuedAt,
        status: "issued",
      };
      return certificate;
    });

  if (newCertificates.length === 0) return 0;

  await batchWrite(
    newCertificates.map((certificate) => ({
      type: "set" as const,
      collection: COLLECTION,
      docId: certificateId(event.id, certificate.userId),
      data: certificate,
    }))
  );

  await createActivityLog({
    userId: issuedById,
    action: "certificate-issued",
    description: `Issued ${newCertificates.length} certificate${newCertificates.length === 1 ? "" : "s"} for "${event.title}"`,
    entityType: "event",
    entityId: event.id,
  });

  // Group by portal so each recipient's link opens their own Certificates page.
  const byRoute = new Map<string, string[]>();
  newCertificates.forEach((certificate) => {
    const route = CERTIFICATES_ROUTE_BY_ROLE[certificate.recipientRole] ?? "";
    byRoute.set(route, [...(byRoute.get(route) ?? []), certificate.userId]);
  });
  await Promise.all(
    [...byRoute.entries()].map(([route, ids]) =>
      notifyUsers(ids, {
        type: "certificate-issued",
        title: "You've earned a certificate",
        message: `For "${event.title}" — view or download it from your Certificates page.`,
        relatedId: event.id,
        relatedType: "certificate",
        actionUrl: route || undefined,
      })
    )
  ).catch((error) => logger.error(`Failed to notify certificate recipients for event ${event.id}`, error));

  logger.info(`Issued ${newCertificates.length} certificates for event ${event.id}`);
  return newCertificates.length;
}

/** A user's certificates, newest first. */
export async function getCertificatesForUser(userId: string): Promise<Certificate[]> {
  const certificates = await queryDocs<Certificate>(COLLECTION, [{ field: "userId", operator: "==", value: userId }]);
  return certificates.sort((a, b) => (toDate(b.issuedAt)?.getTime() ?? 0) - (toDate(a.issuedAt)?.getTime() ?? 0));
}

/** One certificate, for its holder, anyone above them in their chain, or Head RO / developer. */
export async function getCertificateForViewer(
  certificateIdValue: string,
  viewer: { userId: string; role: UserRole }
): Promise<Certificate> {
  const certificate = await getDocById<Certificate>(COLLECTION, certificateIdValue);
  if (!certificate) throw new NotFoundError("Certificate not found");
  if (certificate.userId !== viewer.userId) {
    const holder = await getDocById<User>("users", certificate.userId);
    if (!holder || !(await canAccessUserInChain(viewer, holder))) throw new AuthorizationError();
  }
  return certificate;
}
