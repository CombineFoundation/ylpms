import { z } from "zod";
import {
  TRAINING_CATEGORIES,
  type TrainingAudience,
  type TrainingResource,
  type TrainingResourceType,
} from "@/types/training.types";

export type ApiTrainingResource = Omit<TrainingResource, "createdAt" | "updatedAt"> & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

export const typeLabels: Record<TrainingResourceType, string> = {
  video: "Video",
  pdf: "PDF",
  ppt: "Slides (PPT)",
  assignment: "Assignment",
};

export const typeStyles: Record<TrainingResourceType, string> = {
  video: "bg-red-50 text-red-600",
  pdf: "bg-blue-50 text-blue-600",
  ppt: "bg-amber-50 text-amber-700",
  assignment: "bg-emerald-50 text-emerald-700",
};

/** Every published resource is visible to all roles; stored for compatibility with older resources. */
export const ALL_AUDIENCES: TrainingAudience[] = ["sro", "ro", "youth-leader", "volunteer"];

export const audienceLabels: Record<TrainingAudience, string> = {
  sro: "SROs",
  ro: "ROs",
  "youth-leader": "Youth Leaders",
  volunteer: "Volunteers",
};

export const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "video", label: "Videos" },
  { value: "pdf", label: "PDFs" },
  { value: "ppt", label: "Slides" },
  { value: "assignment", label: "Assignments" },
] as const;
export type TypeFilter = (typeof TYPE_FILTERS)[number]["value"];

export { TRAINING_CATEGORIES };

export const trainingFormSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    type: z.enum(["video", "pdf", "ppt", "assignment"]),
    category: z.enum(TRAINING_CATEGORIES),
    /** Link to it elsewhere, or upload the file itself. */
    source: z.enum(["link", "upload"]),
    url: z.string().trim(),
    duration: z.string().trim(),
    pages: z.string().trim(),
    audience: z.array(z.enum(["sro", "ro", "youth-leader", "volunteer"])).min(1, "Choose at least one audience"),
    published: z.boolean(),
  })
  .refine((data) => data.source !== "link" || /^https:\/\/\S+\.\S+/.test(data.url), {
    message: "Enter a full link starting with https://",
    path: ["url"],
  })
  .refine((data) => data.type !== "video" || data.duration === "" || /^\d{1,3}:[0-5]\d$/.test(data.duration), {
    message: "Use mm:ss, e.g. 45:20",
    path: ["duration"],
  })
  .refine((data) => data.pages === "" || (Number.isInteger(Number(data.pages)) && Number(data.pages) >= 1), {
    message: "Enter a whole number",
    path: ["pages"],
  });

export type TrainingForm = z.infer<typeof trainingFormSchema>;
