import { z, ZodSchema } from "zod";
import { ValidationError } from "./errors";
import { memberIdSchema } from "./member-id";
import { cityField, isHecUniversity, isPakistanCity, universityField } from "./places";

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\+?[0-9][0-9\s-]{6,17}$/.test(value), "Enter a valid phone number")
  .optional();

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

/** One of the HEC-recognised universities; "" clears it on edits. */
const universitySchema = universityField(false).optional();

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  region: z.string().trim().min(2, "Region must be at least 2 characters").optional(),
  role: z.enum(["developer", "head-ro", "sro", "ro", "youth-leader", "volunteer"]),
  phone: phoneSchema,
  parentId: z.string().optional(),
  memberId: memberIdSchema,
  university: universitySchema,
}).superRefine((data, ctx) => {
  // Youth leaders and volunteers are students: their region is their city, and both come from the lists.
  if (data.role !== "youth-leader" && data.role !== "volunteer") return;
  if (!data.region || !isPakistanCity(data.region)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["region"], message: "Choose a city from the list" });
  }
  if (!data.university || !isHecUniversity(data.university)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["university"], message: "Choose a university from the list" });
  }
});

/** Fields any user may change on their own profile. */
export const selfUpdateUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  phone: phoneSchema,
  profilePicture: z.string().optional(),
  university: universitySchema,
});

/** Fields a manager may change on someone they manage. */
export const updateUserSchema = selfUpdateUserSchema.extend({
  region: z.string().trim().min(2, "Region must be at least 2 characters").optional(),
  memberId: memberIdSchema.optional(),
  status: z.enum(["active", "inactive", "suspended", "pending"]).optional(),
});

export const assignUsersSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, "Select at least one user").max(200),
});

export const setManagerSchema = z.object({
  /** null unassigns the user. */
  managerId: z.string().min(1).nullable(),
});

// Task validation schemas
// The client sends the end of the chosen local day, so "due today" is still in the future.
export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(1, "Must assign to a user"),
  dueDate: z
    .string()
    .refine(isValidDate, "Invalid due date")
    .refine((date) => new Date(date) > new Date(), "Due date can't be in the past"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  /** One of the assigner's open activities this task is for. */
  eventId: z.string().min(1).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
  status: z.enum(["assigned", "in-progress", "completed", "overdue", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().refine(isValidDate, "Invalid due date").optional(),
  assignedTo: z.string().min(1).optional(),
  /** null removes the activity link. */
  eventId: z.string().min(1).nullable().optional(),
});

// Volunteer validation schemas
export const createVolunteerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  reportingToId: z.string().min(1, "Must assign a reporting officer"),
  joinDate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relation: z.string(),
  }).optional(),
});

export const updateVolunteerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "on-leave", "suspended"]).optional(),
  hoursVolunteered: z.number().min(0).optional(),
  tasksCompleted: z.number().min(0).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

// Event validation schemas
const eventTypeSchema = z.enum(["workshop", "training", "meeting", "volunteer-event", "other"]);
const eventModeSchema = z.enum(["onsite", "online"]);

export const createEventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  type: eventTypeSchema,
  mode: eventModeSchema.default("onsite"),
  startDate: z
    .string()
    .refine(isValidDate, "Invalid start date")
    .refine((date) => new Date(date) > new Date(), "Start date must be in the future"),
  endDate: z.string().refine(isValidDate, "Invalid end date"),
  location: z.string().trim().min(3, "Location must be at least 3 characters"),
  maxAttendees: z.number().int().min(1, "Max attendees must be at least 1").optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

/** Details only — status changes go through POST /api/events/[eventId]/workflow. */
export const updateEventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
  type: eventTypeSchema.optional(),
  mode: eventModeSchema.optional(),
  startDate: z.string().refine(isValidDate, "Invalid start date").optional(),
  endDate: z.string().refine(isValidDate, "Invalid end date").optional(),
  location: z.string().trim().min(3, "Location must be at least 3 characters").optional(),
  maxAttendees: z.number().int().min(1, "Max attendees must be at least 1").nullable().optional(),
}).refine(
  (data) => !data.startDate || !data.endDate || new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

/** A PDF already uploaded via POST /api/reports/attachments. */
const attachmentSchema = z.object({
  path: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  size: z.number().int().positive(),
});

const workflowComment = z.string().trim().max(1000, "Comment must be 1000 characters or fewer").optional();

/** One step of the activity workflow (see event.service). */
export const eventWorkflowSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("submit") }),
  z.object({ action: z.literal("approve"), comment: workflowComment }),
  z.object({
    action: z.literal("reject"),
    comment: z.string().trim().min(3, "Please give a reason for rejecting this event").max(1000),
  }),
  z.object({ action: z.literal("start") }),
  z.object({
    action: z.literal("submit-evidence"),
    evidence: z.object({
      summary: z.string().trim().min(20, "Describe what happened in at least 20 characters").max(3000),
      participantIds: z.array(z.string().min(1)).min(1, "Select at least one participant").max(500),
      attachments: z.array(attachmentSchema).max(5, "Attach at most 5 PDFs").default([]),
    }),
  }),
  z.object({
    action: z.literal("return-evidence"),
    comment: z.string().trim().min(3, "Please say what needs to change").max(1000),
  }),
  z.object({ action: z.literal("verify"), comment: workflowComment }),
  z.object({ action: z.literal("cancel"), comment: workflowComment }),
]);

export const eventAttendanceSchema = z.object({ action: z.enum(["join", "leave"]) });

/** The assignee hands in their work (marks the task completed). */
export const submitTaskSchema = z.object({
  note: z.string().trim().min(5, "Describe what you did in at least 5 characters").max(3000),
  attachments: z.array(attachmentSchema).max(5, "Attach at most 5 PDFs").default([]),
});

// Report validation schemas
export const createReportSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["monthly", "quarterly", "annual", "task-completion", "volunteer-hours", "custom"]),
  period: z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
  }),
  content: z.object({
    summary: z.string().min(10, "Summary must be at least 10 characters"),
    achievements: z.array(z.string().min(3)).min(1, "At least one achievement required"),
    challenges: z.array(z.string().min(3)).min(1, "At least one challenge required"),
    metrics: z.record(z.number()),
    /** PDFs already uploaded via POST /api/reports/attachments. */
    attachments: z.array(attachmentSchema).max(5, "Attach at most 5 PDFs").optional(),
  }),
});

/** Reviewers can only move a report forward; drafting/submitting is the submitter's job. */
export const updateReportStatusSchema = z.object({
  status: z.enum(["reviewed", "approved", "rejected"]),
  reviewComment: z.string().trim().max(1000, "Comment must be 1000 characters or fewer").optional(),
}).refine(
  (data) => data.status !== "rejected" || (data.reviewComment && data.reviewComment.length >= 3),
  { message: "Please give a reason for rejecting this report", path: ["reviewComment"] }
);

// Member requests (RO asks SRO for a youth leader; youth leader asks RO for a volunteer)
export const createMemberRequestSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  phone: phoneSchema,
  /** The new member's city. */
  region: cityField(true),
  university: universityField(true),
});

/** An RO's youth leader request carries the new youth leader's ID; a volunteer's ID is set by the approving RO. */
export const createYouthLeaderRequestSchema = createMemberRequestSchema.extend({ memberId: memberIdSchema });

export const reviewMemberRequestSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().trim().max(1000, "Comment must be 1000 characters or fewer").optional(),
  /** The new member's ID, when the request didn't already carry one (volunteers). */
  memberId: memberIdSchema.optional(),
}).refine(
  (data) => data.decision !== "rejected" || (data.comment && data.comment.length >= 3),
  { message: "Please give a reason for rejecting this request", path: ["comment"] }
);

// Generic validation function
export async function validateData<T>(
  schema: ZodSchema,
  data: unknown
): Promise<T> {
  try {
    const result = await schema.parseAsync(data);
    return result as T;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });
      throw new ValidationError("Validation failed", fieldErrors);
    }
    throw error;
  }
}

// Training Portal resource schemas
const trainingResourceBase = {
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  type: z.enum(["video", "pdf", "ppt", "assignment"]),
  category: z.enum([
    "Leadership",
    "Community Engagement",
    "Volunteer Management",
    "Communication",
    "Delegation",
    "Team Motivation",
    "Program Planning",
  ]),
  audience: z.array(z.enum(["sro", "ro", "youth-leader", "volunteer"])).min(1, "Choose at least one audience"),
  published: z.boolean(),
};

const trainingUrlSchema = z
  .string()
  .trim()
  .url("Enter a full link starting with https://")
  .refine((value) => value.startsWith("https://"), "Links must use https://");

/** A file already uploaded via POST /api/training/uploads. */
const trainingFileSchema = z.object({
  path: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  size: z.number().int().positive(),
  contentType: z.string().min(1).max(200),
});

export const createTrainingResourceSchema = z
  .object({
    ...trainingResourceBase,
    url: trainingUrlSchema.optional(),
    file: trainingFileSchema.optional(),
    duration: z.string().trim().regex(/^\d{1,3}:[0-5]\d$/, "Use mm:ss, e.g. 45:20").optional(),
    pages: z.number().int().min(1).max(2000).optional(),
  })
  .refine((data) => !!data.url !== !!data.file, { message: "Add a link or upload a file", path: ["url"] });

export const updateTrainingResourceSchema = z
  .object(trainingResourceBase)
  .partial()
  .extend({
    // null clears the field; setting a link clears the file and vice versa.
    url: trainingUrlSchema.nullable().optional(),
    file: trainingFileSchema.nullable().optional(),
    duration: z.string().trim().regex(/^\d{1,3}:[0-5]\d$/, "Use mm:ss, e.g. 45:20").nullable().optional(),
    pages: z.number().int().min(1).max(2000).nullable().optional(),
  })
  .strict()
  .refine((data) => !(data.url && data.file), { message: "Use either a link or a file, not both", path: ["url"] })
  .refine((data) => !(data.url === null && data.file === null), { message: "Add a link or upload a file", path: ["url"] });

// Notification preference validation schemas
export const updateNotificationPreferencesSchema = z.object({
  reportSubmissions: z.boolean().optional(),
  newRegistrations: z.boolean().optional(),
  taskUpdates: z.boolean().optional(),
  eventReminders: z.boolean().optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.string().transform(Number).refine((n) => n > 0, "Page must be greater than 0").optional(),
  limit: z.string().transform(Number).refine((n) => n > 0 && n <= 100, "Limit must be between 1 and 100").optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Cohorts (Head RO starts the next one; dates are Pakistan calendar days)
const dateValueSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");

export const startCohortSchema = z.object({ startDate: dateValueSchema, endDate: dateValueSchema });

export const updateCohortFiguresSchema = z
  .object({
    digitalReach: z.number().int().min(0).max(1_000_000_000).optional(),
    studentBodyPartnerships: z.number().int().min(0).max(100_000).optional(),
  })
  .strict();
