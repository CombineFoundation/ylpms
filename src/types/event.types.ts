import { Timestamp } from "firebase/firestore";
import type { ReportAttachment } from "./report.types";
import type { UserRole } from "./user.types";

/**
 * Activity workflow: Create → Submit → Review → Approve → Conduct →
 * Submit Evidence → Verify → Certificates.
 *
 * - draft / submitted / rejected: a youth leader's proposal, awaiting their
 *   manager's approval (events organized by an RO or above skip straight to planned).
 * - planned: approved and open for sign-ups.
 * - ongoing: being conducted.
 * - evidence-submitted: the organizer has reported who took part, awaiting verification.
 * - completed: verified; participation certificates have been issued.
 */
export type EventStatus =
  | "draft"
  | "submitted"
  | "rejected"
  | "planned"
  | "ongoing"
  | "evidence-submitted"
  | "completed"
  | "cancelled";

export type EventType = "workshop" | "training" | "meeting" | "volunteer-event" | "other";

/** Held in person, or online (a webinar). Activities from before this was recorded count as onsite. */
export type EventMode = "onsite" | "online";

/** What the organizer reports after conducting the activity. */
export interface EventEvidence {
  summary: string;
  /** Users who actually took part; each gets a participation certificate on verification. */
  participantIds: string[];
  /** PDFs (attendance sheets, photos, …) uploaded via POST /api/reports/attachments. */
  attachments: ReportAttachment[];
  submittedBy: string;
  submittedAt: Timestamp | Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  mode?: EventMode;
  status: EventStatus;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  location: string;
  attendees: string[]; // User IDs who signed up
  organizerIds: string[]; // User IDs of organizers
  /** Role of the organizer when it was created; youth leaders need approval. */
  organizerRole?: UserRole;
  maxAttendees?: number;
  image?: string;
  submittedAt?: Timestamp | Date;
  /** Last approve/reject/verify/return decision. */
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Timestamp | Date;
  reviewComment?: string;
  evidence?: EventEvidence;
  certificatesIssuedAt?: Timestamp | Date;
  /** Given the first time the activity issues certificates; the middle part of "YLP/007/001". */
  certificateActivityNumber?: number;
  certificateCount?: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  type: EventType;
  mode: EventMode;
  startDate: Date;
  endDate: Date;
  location: string;
  maxAttendees?: number;
  image?: File;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  type?: EventType;
  mode?: EventMode;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  /** null clears the attendee cap. */
  maxAttendees?: number | null;
}

export type EventWorkflowAction =
  | "submit"
  | "approve"
  | "reject"
  | "start"
  | "submit-evidence"
  | "return-evidence"
  | "verify"
  | "cancel";

/** What the signed-in user (or the portal user a developer acts as) may do with an event. */
export interface EventPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canReview: boolean;
  canStart: boolean;
  canSubmitEvidence: boolean;
  canVerify: boolean;
  canCancel: boolean;
  canJoin: boolean;
  canLeave: boolean;
  canViewEvidence: boolean;
}

/** An event as list endpoints return it: names resolved and permissions computed server-side. */
export type EventListItem = Event & {
  organizerName: string;
  attendeeCount: number;
  isAttending: boolean;
  isOrganizer: boolean;
  permissions: EventPermissions;
};

/** Approved activities still to run (or running): tasks can be linked to these until they end. */
export const OPEN_ACTIVITY_STATUSES: EventStatus[] = ["planned", "ongoing"];
