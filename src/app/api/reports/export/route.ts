import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getReports, enrichReportsForList } from "@/services/report.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError, ValidationError } from "@/utils/errors";
import { apiError } from "@/utils/api-response";
import { timestampToDate, type TimestampInput } from "@/utils/user-status";
import type { Report, ReportStatus } from "@/types/report.types";

const STATUSES: ReportStatus[] = ["draft", "submitted", "reviewed", "approved", "rejected"];
const EXPORT_PAGE_SIZE = 100;
const EXPORT_MAX_ROWS = 5000;

function csvCell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value);
  // Prefix formula-like values so spreadsheets don't execute them.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function isoDate(value: unknown): string {
  const date = timestampToDate(value as TimestampInput);
  return date ? date.toISOString().slice(0, 10) : "";
}

/**
 * GET /api/reports/export?status=approved - All matching reports as CSV (Head RO only)
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();
    requireRole(req.user.role, "head-ro");

    const status = new URL(req.url).searchParams.get("status") as ReportStatus | null;
    if (status && !STATUSES.includes(status)) throw new ValidationError("Invalid status filter");

    const rows: (Report & { submittedByName: string; submittedByRegion: string })[] = [];
    for (let pageNumber = 1; rows.length < EXPORT_MAX_ROWS; pageNumber++) {
      const page = await getReports({ status: status || undefined, pageSize: EXPORT_PAGE_SIZE, pageNumber });
      rows.push(...(await enrichReportsForList(page.items)));
      if (!page.hasMore) break;
    }

    const header = ["Title", "Type", "Status", "Submitted by", "Region", "Period start", "Period end", "Submitted", "Summary", "Review comment"];
    const lines = rows.map((report) =>
      [
        report.title,
        report.type,
        report.status,
        report.submittedByName,
        report.submittedByRegion,
        isoDate(report.period?.startDate),
        isoDate(report.period?.endDate),
        isoDate(report.createdAt),
        report.content?.summary,
        report.reviewComment,
      ].map(csvCell).join(",")
    );

    const csv = [header.join(","), ...lines].join("\r\n");
    const filename = `reports${status ? `-${status}` : ""}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(`﻿${csv}`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return apiError(error);
  }
});
