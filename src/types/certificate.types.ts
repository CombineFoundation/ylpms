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
  /** "YLP{cohort}/{activity}/{position}", e.g. YLP2/007/001 (older certificates use YLP/007/001 or YLP-2026-XXXXXXXX). */
  certificateNumber: string;
  /** The activity's certificate number (shared by everyone certified for it). */
  activityNumber?: number;
  /** Position within the activity: 1 is the organizer (youth leader), then participants. */
  position?: number;
  issuedBy: string;
  issuedByName: string;
  issuedAt: Timestamp | Date;
  status: CertificateStatus;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
