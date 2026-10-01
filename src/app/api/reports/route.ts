import { withAuth } from "@/middleware/auth.middleware";
import { getReports, createReport, enrichReportsForList } from "@/services/report.service";
import { requireRole } from "@/utils/auth";
import { hasScopeParam, resolveActingAs } from "@/utils/sro-scope";
import { requireOwnAttachments } from "@/services/report-attachment.service";
import { AuthenticationError, ValidationError } from "@/utils/errors";
import { createReportSchema } from "@/utils/validation";
import { apiError, apiSuccess, parsePagination } from "@/utils/api-response";
import { ReportStatus } from "@/types/report.types";

const STATUSES: ReportStatus[] = ["draft", "submitted", "reviewed", "approved", "rejected"];

/**
 * GET /api/reports - One page of reports (with submitter info), newest first
 * GET /api/reports?status=submitted&pageSize=25&pageNumber=1
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    // Reports are only relevant from youth-leader and up (volunteers don't submit them)
    requireRole(req.user.role, ["youth-leader", "ro", "sro", "head-ro"]);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ReportStatus | null;
    if (status && !STATUSES.includes(status)) throw new ValidationError("Invalid status filter");

    const isOrgWide = req.user.role === "head-ro" || req.user.role === "developer";
    // A developer in a portal (?sroId= / ?roId= / ?youthLeaderId=) sees that person's own reports.
    const actingAs =
      req.user.role === "developer" && hasScopeParam(req) ? (await resolveActingAs(req.user, req)).userId : null;

    const page = await getReports({
      status: status || undefined,
      // Non-org-wide roles only ever see reports they submitted themselves.
      submittedBy: actingAs ?? (isOrgWide ? undefined : req.user.userId),
      ...parsePagination(searchParams),
    });

    const reports = await enrichReportsForList(page.items);

    return apiSuccess(reports, 200, { page: page.page, pageSize: page.pageSize, hasMore: page.hasMore });
  } catch (error) {
    return apiError(error);
  }
});

/**
 * POST /api/reports - Submit a new report
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    requireRole(req.user.role, ["youth-leader", "ro", "sro", "head-ro"]);

    const validatedData = createReportSchema.parse(await req.json());

    // A developer in the SRO/RO portal (?sroId= / ?roId=) submits as that person, so it shows in their "My reports".
    const submitterId = (await resolveActingAs(req.user, req)).userId;
    await requireOwnAttachments(validatedData.content.attachments ?? [], submitterId);

    const report = await createReport(
      {
        ...validatedData,
        period: {
          startDate: new Date(validatedData.period.startDate),
          endDate: new Date(validatedData.period.endDate),
        },
      },
      submitterId,
      req.user.userId
    );

    return apiSuccess(report, 201);
  } catch (error) {
    return apiError(error);
  }
});
