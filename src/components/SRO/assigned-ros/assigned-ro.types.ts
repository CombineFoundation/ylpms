import { z } from "zod";
import type { DisplayStatus } from "@/utils/user-status";

/** An RO as returned by GET /api/sro/ros. */
export type AssignedRO = {
  id: string;
  name: string;
  email?: string;
  region?: string;
  youthLeaders: number;
  volunteers: number;
  openTasks: number;
  overdueTasks: number;
  reports: number;
  performance: number | null;
  status: DisplayStatus;
};

export const editROFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  region: z.string().trim().min(2, "Region must be at least 2 characters"),
});
export type EditROForm = z.infer<typeof editROFormSchema>;

export function performanceColor(performance: number): string {
  if (performance >= 80) return "text-emerald-600";
  if (performance >= 60) return "text-amber-600";
  return "text-red-500";
}
