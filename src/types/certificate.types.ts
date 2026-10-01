import { Timestamp } from "firebase/firestore";
import type { UserRole } from "./user.types";

export type CertificateKind = "participation" | "organizer";
export type CertificateStatus = "issued" | "revoked";

/**
 * Issued automatically when an activity's evidence is verified: one per
 * participant, plus one for each organizer.
 */
export interface Certificate {
  id: string;
  userId: string;
  recipientName: string;
  recipientRole: UserRole;
  kind: CertificateKind;
  title: string;
  eventId: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: Timestamp | Date;
  certificateNumber: string;
  issuedBy: string;
  issuedByName: string;
  issuedAt: Timestamp | Date;
  status: CertificateStatus;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
