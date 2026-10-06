import type { CertificateKind, CertificateStatus } from "@/types/certificate.types";
import type { UserRole } from "@/types/user.types";
import { timestampToDate, type TimestampInput } from "@/utils/user-status";
import { formatDate } from "@/utils/format-date";
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
  return formatDate(timestampToDate(value));
}

/** Opens the certificate in its own window and triggers print (where it can be saved as a PDF). */
export function printCertificate(certificate: ApiCertificate): boolean {
  const html = certificateHtml(certificate, window.location.origin);
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const tab = window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return !!tab;
}

/** A team certificate, with its holder's email. */
export type ApiTeamCertificate = ApiCertificate & { recipientEmail: string };

/** GET /api/certificates/team: one group per verified activity. */
export type ApiTeamCertificateGroup = {
  activityId: string;
  activityTitle: string;
  activityLocation: string;
  activityDate: TimestampInput;
  issuedAt: TimestampInput;
  issuedByName: string;
  lead: ApiTeamCertificate;
  certificates: ApiTeamCertificate[];
  participantCount: number;
};

const csvCell = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** Downloads every certificate of one activity as a CSV file. */
export function exportActivityCertificatesCsv(group: ApiTeamCertificateGroup) {
  const header = ["Reference No", "Name", "Email", "Activity", "Issued Date"];
  const rows = group.certificates.map((c) => [
    c.certificateNumber,
    c.recipientName,
    c.recipientEmail,
    c.eventTitle,
    formatCertificateDate(c.issuedAt),
  ]);
  const csv = [header, ...rows].map((row) => row.map((value) => csvCell(value ?? "")).join(",")).join("\r\n");

  // BOM so Excel opens it as UTF-8.
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${group.activityTitle.replace(/[^\w-]+/g, "_").replace(/^_+|_+$/g, "") || "activity"}-certificates.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

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
