import type { CertificateKind, CertificateStatus } from "@/types/certificate.types";
import type { UserRole } from "@/types/user.types";
import { timestampToDate, type TimestampInput } from "@/utils/user-status";
import { certificateHtml } from "./certificate-template";

/** A certificate as GET /api/certificates returns it (timestamps serialized). */
export type ApiCertificate = {
  id: string;
  userId: string;
  recipientName: string;
  recipientRole: UserRole;
  kind: CertificateKind;
  title: string;
  eventId: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: TimestampInput;
  certificateNumber: string;
  issuedByName: string;
  issuedAt: TimestampInput;
  status: CertificateStatus;
};

export const kindLabels: Record<CertificateKind, string> = {
  participation: "Participation",
  organizer: "Leadership",
};

export function formatCertificateDate(value: TimestampInput) {
  const date = timestampToDate(value);
  return date ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";
}

/** Opens the certificate in its own window and triggers print (where it can be saved as a PDF). */
export function printCertificate(certificate: ApiCertificate): boolean {
  const html = certificateHtml(certificate, window.location.origin);
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const tab = window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return !!tab;
}

/** GET /api/certificates/team: one group per verified activity. */
export type ApiTeamCertificateGroup = {
  eventId: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: TimestampInput;
  issuedAt: TimestampInput;
  issuedByName: string;
  lead: ApiCertificate;
  certificates: ApiCertificate[];
  participantCount: number;
};

export type ApiTeamCertificates = {
  groups: ApiTeamCertificateGroup[];
  totals: { certificates: number; activities: number; leadership: number; participation: number };
};

export const roleLabels: Partial<Record<UserRole, string>> = {
  developer: "Developer",
  "head-ro": "Head RO",
  sro: "SRO",
  ro: "RO",
  "youth-leader": "Youth Leader",
  volunteer: "Volunteer",
};
