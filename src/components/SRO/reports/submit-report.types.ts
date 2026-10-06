import { z } from "zod";
import { endOfLocalDayIso, toDateInputValue } from "@/components/Head-of-RO/tasks/task-display.types";
import type { ApiReport } from "@/components/Head-of-RO/reports/report-display.types";

/** One entry per line; blank lines ignored. */
export const toLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** "Label: number" per line, e.g. "Volunteers trained: 25". */
export function parseMetrics(value: string): Record<string, number> | null {
  const metrics: Record<string, number> = {};
  for (const line of toLines(value)) {
    const match = line.match(/^(.+?)\s*:\s*(-?\d+(?:\.\d+)?)$/);
    if (!match) return null;
    metrics[match[1].trim()] = Number(match[2]);
  }
  return metrics;
}

const linesField = (label: string) =>
  z
    .string()
    .refine((value) => toLines(value).length > 0, `Add at least one ${label}`)
    .refine((value) => toLines(value).every((line) => line.length >= 3), `Each ${label} must be at least 3 characters`);

export const submitReportSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    type: z.enum(["monthly", "quarterly", "annual", "task-completion", "volunteer-hours", "custom"]),
    startDate: z.string().min(1, "Choose a start date"),
    endDate: z.string().min(1, "Choose an end date"),
    summary: z.string().trim().min(10, "Summary must be at least 10 characters"),
    achievements: linesField("achievement"),
    challenges: linesField("challenge"),
    metrics: z.string().refine((value) => parseMetrics(value) !== null, 'Use one "Label: number" per line'),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "End date can't be before the start date",
    path: ["endDate"],
  });

export type SubmitReportForm = z.infer<typeof submitReportSchema>;

/** A returned report → form values, to edit and resubmit it. */
export function toReportForm(report: ApiReport): SubmitReportForm {
  return {
    title: report.title,
    type: report.type,
    startDate: toDateInputValue(report.period?.startDate),
    endDate: toDateInputValue(report.period?.endDate),
    summary: report.content?.summary ?? "",
    achievements: (report.content?.achievements ?? []).join("\n"),
    challenges: (report.content?.challenges ?? []).join("\n"),
    metrics: Object.entries(report.content?.metrics ?? {})
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n"),
  };
}

/** Form values → POST /api/reports body. */
export function toReportPayload(values: SubmitReportForm) {
  const [year, month, day] = values.startDate.split("-").map(Number);
  return {
    title: values.title,
    type: values.type,
    period: {
      startDate: new Date(year, month - 1, day).toISOString(),
      endDate: endOfLocalDayIso(values.endDate),
    },
    content: {
      summary: values.summary,
      achievements: toLines(values.achievements),
      challenges: toLines(values.challenges),
      metrics: parseMetrics(values.metrics) ?? {},
    },
  };
}
