import type { CertificateKind, CertificateStatus } from "@/types/certificate.types";
import type { UserRole } from "@/types/user.types";
import { timestampToDate, type TimestampInput } from "@/utils/user-status";

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

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** Standalone printable page for one certificate (print → "Save as PDF" to download it). */
export function certificateHtml(certificate: ApiCertificate) {
  const line =
    certificate.kind === "organizer"
      ? "for leading and organizing"
      : "for active participation in";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(certificate.certificateNumber)} · ${escapeHtml(certificate.title)}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Georgia, "Times New Roman", serif; color: #0f172a; background: #f8fafc; }
  .page { width: 297mm; height: 210mm; padding: 14mm; margin: 0 auto; background: #fff; }
  .frame { height: 100%; border: 3px solid #f97316; outline: 1px solid #fdba74; outline-offset: -10px; padding: 18mm 22mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; }
  .org { font-family: Arial, sans-serif; letter-spacing: .2em; font-size: 12px; color: #f97316; font-weight: 700; text-transform: uppercase; }
  h1 { font-size: 40px; margin: 6px 0 0; letter-spacing: .02em; }
  .presented { font-size: 16px; color: #475569; margin-top: 18px; }
  .name { font-size: 36px; font-style: italic; margin: 10px 0; padding: 0 30px 6px; border-bottom: 1px solid #cbd5e1; }
  .reason { font-size: 16px; color: #475569; }
  .event { font-size: 22px; font-weight: 700; margin-top: 6px; }
  .meta { font-size: 14px; color: #64748b; margin-top: 4px; }
  .footer { width: 100%; display: flex; justify-content: space-between; align-items: flex-end; font-family: Arial, sans-serif; font-size: 12px; color: #475569; }
  .sign { border-top: 1px solid #94a3b8; padding-top: 6px; min-width: 200px; }
  @media print { body { background: #fff; } .page { margin: 0; } }
</style>
</head>
<body>
<div class="page"><div class="frame">
  <div>
    <div class="org">Combine Foundation · Youth Leadership Program</div>
    <h1>${escapeHtml(certificate.title)}</h1>
  </div>
  <div>
    <div class="presented">This certificate is proudly presented to</div>
    <div class="name">${escapeHtml(certificate.recipientName)}</div>
    <div class="reason">${line}</div>
    <div class="event">${escapeHtml(certificate.eventTitle)}</div>
    <div class="meta">${escapeHtml(certificate.eventLocation)} · ${escapeHtml(formatCertificateDate(certificate.eventDate))}</div>
  </div>
  <div class="footer">
    <div style="text-align:left">Certificate No. <strong>${escapeHtml(certificate.certificateNumber)}</strong><br />Issued ${escapeHtml(formatCertificateDate(certificate.issuedAt))}</div>
    <div class="sign">${escapeHtml(certificate.issuedByName)}<br />Verified by</div>
  </div>
</div></div>
<script>window.onload = function () { window.focus(); window.print(); };</script>
</body>
</html>`;
}

/** Opens the certificate in its own window and triggers print (where it can be saved as a PDF). */
export function printCertificate(certificate: ApiCertificate): boolean {
  const url = URL.createObjectURL(new Blob([certificateHtml(certificate)], { type: "text/html" }));
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
