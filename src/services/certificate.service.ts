import { assignSequenceNumber, batchWrite, getDocById, getDocsByIds, queryDocs, updateDoc } from "@/utils/firestore";
import { toDate } from "@/utils/aggregation";
import { canAccessUserInChain } from "@/utils/authorization";
import { AuthorizationError, NotFoundError, logger } from "@/utils/errors";
import { createActivityLog } from "./activitylog.service";
import { notifyUsers } from "./notification.service";
import { chunk, getTeam } from "./team.service";
import { getCurrentCohort } from "./cohort.service";
import { FIRST_SYSTEM_COHORT, cohortId } from "@/config/cohorts";
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

const pad = (value: number) => String(value).padStart(3, "0");

/**
 * "YLP{cohort}/{activity}/{position}", e.g. YLP2/007/001: the cohort the
 * activity was first certified in, the activity's number within that cohort
 * (restarting at 001 each cohort), and the certificate's position within the
 * activity — the organizer (youth leader) is 001, participants follow.
 */
const certificateNumber = (cohortNumber: number, activityNumber: number, position: number) =>
  `YLP${cohortNumber}/${pad(activityNumber)}/${pad(position)}`;

/** Activity counter per cohort. YLP 2.0 keeps the original counter so activities numbered before cohorts were added don't repeat. */
const activityCounterId = (id: string) =>
  id === FIRST_SYSTEM_COHORT.id ? "certificate-activities" : `certificate-activities-${id}`;

/** Organizers first (youth leaders before anyone else), then participants by name. */
function issueOrder(kindByUser: Map<string, CertificateKind>) {
  return (a: User, b: User) => {
    const rank = (user: User) => (kindByUser.get(user.id) === "organizer" ? (user.role === "youth-leader" ? 0 : 1) : 2);
    return rank(a) - rank(b) || a.name.localeCompare(b.name);
  };
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
    queryDocs<Certificate>(COLLECTION, [{ field: "eventId", operator: "==", value: event.id }]),
    getDocById<User>("users", issuedById),
  ]);
  const alreadyIssued = new Set(existing.map((certificate) => certificate.userId));
  const pending = recipients.filter((recipient) => !alreadyIssued.has(recipient.id)).sort(issueOrder(kindByUser));
  if (pending.length === 0) return 0;

  // An activity stays in the cohort it was first certified in, even if more certificates follow after a new cohort starts.
  let cohortNumber = event.certificateCohortNumber;
  if (!cohortNumber) {
    cohortNumber = (await getCurrentCohort()).number;
    await updateDoc("events", event.id, { certificateCohortNumber: cohortNumber });
  }
  const activityNumber = await assignSequenceNumber(
    activityCounterId(cohortId(cohortNumber)),
    "events",
    event.id,
    "certificateActivityNumber"
  );
  // Certificates added later (e.g. evidence re-verified with more participants) continue the activity's numbering.
  const lastPosition = existing.reduce((max, certificate) => Math.max(max, certificate.position ?? 0), 0);
  const issuedAt = new Date();

  const newCertificates = pending.map((recipient, index) => {
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
      certificateNumber: certificateNumber(cohortNumber, activityNumber, lastPosition + index + 1),
      activityNumber,
      position: lastPosition + index + 1,
      issuedBy: issuedById,
      issuedByName: issuer?.name || "Combine Foundation",
      issuedAt,
      status: "issued",
    };
    return certificate;
  });

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

// ---------------------------------------------------------------------------
// Team view (Head RO / SRO / RO)

/** One verified activity's certificates, shown as a single row led by its organizer's certificate. */
export interface TeamCertificateGroup {
  eventId: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: Certificate["eventDate"];
  issuedAt: Certificate["issuedAt"];
  issuedByName: string;
  /** The organizer's (usually the youth leader's) certificate; a participant's if no organizer is in scope. */
  lead: Certificate;
  /** Everyone in scope certified for this activity: organizers first, then participants by name. */
  certificates: Certificate[];
  participantCount: number;
}

export interface TeamCertificates {
  groups: TeamCertificateGroup[];
  totals: { certificates: number; activities: number; leadership: number; participation: number };
}

const time = (value: unknown) => toDate(value)?.getTime() ?? 0;

/** Organizers first (youth leaders before others), then by name. */
function byLeadership(a: Certificate, b: Certificate) {
  const rank = (c: Certificate) => (c.kind === "organizer" ? (c.recipientRole === "youth-leader" ? 0 : 1) : 2);
  return rank(a) - rank(b) || a.recipientName.localeCompare(b.recipientName);
}

/**
 * Certificates issued to the viewer's team, grouped by activity so a youth
 * leader's activity appears once (their certificate) with its volunteers'
 * certificates as the details. Head RO / developer see the whole program; an
 * SRO or RO sees themselves and everyone below them.
 */
export async function getTeamCertificates(viewer: { userId: string; role: UserRole }): Promise<TeamCertificates> {
  try {
    let certificates: Certificate[];
    if (viewer.role === "head-ro" || viewer.role === "developer") {
      certificates = await queryDocs<Certificate>(COLLECTION, [{ field: "status", operator: "==", value: "issued" }]);
    } else {
      const { memberIds } = await getTeam(viewer.userId);
      const ids = [viewer.userId, ...memberIds];
      certificates = (
        await Promise.all(chunk(ids).map((group) => queryDocs<Certificate>(COLLECTION, [{ field: "userId", operator: "in", value: group }])))
      )
        .flat()
        .filter((certificate) => certificate.status === "issued");
    }

    const byEvent = new Map<string, Certificate[]>();
    certificates.forEach((certificate) => byEvent.set(certificate.eventId, [...(byEvent.get(certificate.eventId) ?? []), certificate]));

    const groups: TeamCertificateGroup[] = [...byEvent.values()].map((list) => {
      const sorted = [...list].sort(byLeadership);
      const lead = sorted[0];
      return {
        eventId: lead.eventId,
        eventTitle: lead.eventTitle,
        eventLocation: lead.eventLocation,
        eventDate: lead.eventDate,
        issuedAt: list.reduce((earliest, c) => (time(c.issuedAt) < time(earliest) ? c.issuedAt : earliest), lead.issuedAt),
        issuedByName: lead.issuedByName,
        lead,
        certificates: sorted,
        participantCount: list.filter((c) => c.kind === "participation").length,
      };
    });
    groups.sort((a, b) => time(b.issuedAt) - time(a.issuedAt));

    const leadership = certificates.filter((c) => c.kind === "organizer").length;
    return {
      groups,
      totals: {
        certificates: certificates.length,
        activities: groups.length,
        leadership,
        participation: certificates.length - leadership,
      },
    };
  } catch (error) {
    logger.error(`Error loading team certificates for ${viewer.userId}`, error);
    throw error;
  }
}
