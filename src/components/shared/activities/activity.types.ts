import { z } from "zod";
import type { EventMode, EventPermissions, EventStatus, EventType } from "@/types/event.types";
import type { ReportAttachment } from "@/types/report.types";
import type { UserRole } from "@/types/user.types";
import { timestampToDate, type TimestampInput } from "@/utils/user-status";
import type { ScopedRole } from "@/utils/portal-scope";

/** Which portal the board is rendered in; Head RO's isn't a scoped (per-person) portal. */
export type ActivityPortal = ScopedRole | "head-ro";

/** An event as GET /api/events returns it (timestamps serialized). */
export type ApiActivity = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  /** Missing on activities created before the format was recorded (counted as onsite). */
  mode?: EventMode;
  status: EventStatus;
  startDate: TimestampInput;
  endDate: TimestampInput;
  location: string;
  maxAttendees?: number;
  organizerIds: string[];
  organizerRole?: UserRole;
  organizerName: string;
  attendeeCount: number;
  isAttending: boolean;
  isOrganizer: boolean;
  reviewComment?: string;
  reviewedByName?: string;
  reviewedAt?: TimestampInput;
  certificateCount?: number;
  evidence?: {
    summary: string;
    participantIds: string[];
    attachments: ReportAttachment[];
    submittedAt: TimestampInput;
  };
  permissions: EventPermissions;
};

type Person = { id: string; name: string; role: UserRole };

/** GET /api/events/[eventId] adds names for the people who manage the event. */
export type ApiActivityDetail = ApiActivity & {
  attendeeList?: Person[];
  participantList?: Person[];
  candidateList?: (Person & { signedUp: boolean })[];
};

export const typeLabels: Record<EventType, string> = {
  workshop: "Workshop",
  training: "Training",
  meeting: "Meeting",
  "volunteer-event": "Volunteer Event",
  other: "Other",
};

export const modeLabels: Record<EventMode, string> = {
  onsite: "Onsite",
  online: "Online (webinar)",
};

export const typeStyles: Record<EventType, string> = {
  workshop: "bg-orange-100 text-orange-600",
  training: "bg-purple-100 text-purple-600",
  meeting: "bg-blue-100 text-blue-600",
  "volunteer-event": "bg-emerald-100 text-emerald-600",
  other: "bg-gray-100 text-gray-500",
};

export const statusLabels: Record<EventStatus, string> = {
  draft: "Draft",
  submitted: "Awaiting approval",
  rejected: "Needs changes",
  planned: "Approved",
  ongoing: "In progress",
  "evidence-submitted": "Awaiting verification",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const statusStyles: Record<EventStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
  planned: "bg-emerald-50 text-emerald-700",
  ongoing: "bg-blue-50 text-blue-700",
  "evidence-submitted": "bg-purple-50 text-purple-700",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-500 line-through",
};

/** The activity workflow, as shown on a youth leader's activities. */
export const WORKFLOW_STEPS = [
  "Create",
  "Submit",
  "Review",
  "Approve",
  "Conduct",
  "Submit Evidence",
  "Verify",
  "Certificates",
] as const;

/** How many workflow steps are done at each status (cancelled shows no progress). */
const stepsDone: Record<EventStatus, number> = {
  draft: 1,
  submitted: 2,
  rejected: 3,
  planned: 4,
  ongoing: 5,
  "evidence-submitted": 6,
  completed: 8,
  cancelled: 0,
};

export function completedSteps(status: EventStatus) {
  return stepsDone[status];
}

/** Only youth leaders' activities go through review; others are approved on creation. */
export const usesWorkflow = (activity: Pick<ApiActivity, "organizerRole">) => activity.organizerRole === "youth-leader";

export function formatActivityRange(start?: TimestampInput, end?: TimestampInput): string {
  const startDate = timestampToDate(start);
  const endDate = timestampToDate(end);
  if (!startDate) return "-";
  const day = (date: Date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const time = (date: Date) => date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (!endDate) return `${day(startDate)} · ${time(startDate)}`;
  return startDate.toDateString() === endDate.toDateString()
    ? `${day(startDate)} · ${time(startDate)}–${time(endDate)}`
    : `${day(startDate)} – ${day(endDate)}`;
}

export function toDateTimeInputValue(value?: TimestampInput): string {
  const date = timestampToDate(value);
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const baseActivityForm = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  type: z.enum(["workshop", "training", "meeting", "volunteer-event", "other"]),
  mode: z.enum(["onsite", "online"]),
  location: z.string().trim().min(3, "Location must be at least 3 characters"),
  startDate: z.string().min(1, "Choose a start date and time"),
  endDate: z.string().min(1, "Choose an end date and time"),
  maxAttendees: z
    .string()
    .refine((value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 1), "Enter a whole number of at least 1"),
});

const endAfterStart = (data: { startDate: string; endDate: string }) =>
  !data.startDate || !data.endDate || new Date(data.endDate) > new Date(data.startDate);

export const editActivityFormSchema = baseActivityForm.refine(endAfterStart, {
  message: "End must be after the start",
  path: ["endDate"],
});

export const createActivityFormSchema = baseActivityForm
  .refine((data) => !data.startDate || new Date(data.startDate) > new Date(), {
    message: "Start must be in the future",
    path: ["startDate"],
  })
  .refine(endAfterStart, { message: "End must be after the start", path: ["endDate"] });

export type ActivityForm = z.infer<typeof baseActivityForm>;

export const evidenceFormSchema = z.object({
  summary: z.string().trim().min(20, "Describe what happened in at least 20 characters").max(3000),
  participantIds: z.array(z.string()).min(1, "Select at least one participant"),
});

export type EvidenceForm = z.infer<typeof evidenceFormSchema>;
