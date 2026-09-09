import { z, ZodSchema } from "zod";
import { ValidationError } from "./errors";

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["head-ro", "sro", "ro", "youth-leader", "volunteer"]),
  phone: z.string().optional(),
  parentId: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  profilePicture: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended", "pending"]).optional(),
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(1, "Must assign to a user"),
  dueDate: z.string().refine((date) => new Date(date) > new Date(), "Due date must be in the future"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(["assigned", "in-progress", "completed", "overdue", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
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
export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["workshop", "training", "meeting", "volunteer-event", "other"]),
  startDate: z.string().refine((date) => new Date(date) > new Date(), "Start date must be in the future"),
  endDate: z.string(),
  location: z.string().min(3, "Location must be at least 3 characters"),
  maxAttendees: z.number().min(1).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

export const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(["planned", "ongoing", "completed", "cancelled"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().min(3).optional(),
  maxAttendees: z.number().min(1).optional(),
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
  }),
});

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

// Pagination validation
export const paginationSchema = z.object({
  page: z.string().transform(Number).refine((n) => n > 0, "Page must be greater than 0").optional(),
  limit: z.string().transform(Number).refine((n) => n > 0 && n <= 100, "Limit must be between 1 and 100").optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
