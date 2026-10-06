import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import {
  canViewReport,
  getReportById,
  updateReportStatus,
  deleteReport,
  enrichReportsForList,
  resubmitReport,
} from "@/services/report.service";
import { requireOwnAttachments } from "@/services/report-attachment.service";
import { getMemberProfiles } from "@/services/team.service";
import { isInManagerChain } from "@/utils/authorization";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors";
import { createReportSchema, updateReportStatusSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ reportId: string }> };

/**
 * GET /api/reports/[reportId] - Get a single report (with submitter info)
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { reportId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const report = await getReportById(reportId);
      if (!report) throw new NotFoundError("Report not found");

      if (!(await canViewReport(authReq.user, report.submittedBy))) {
        throw new AuthorizationError();
      }

      const [[enriched], profiles] = await Promise.all([
        enrichReportsForList([report]),
        getMemberProfiles([report.submittedBy]),
      ]);
      return apiSuccess({ ...enriched, submitterProfile: profiles.get(report.submittedBy) });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * PATCH /api/reports/[reportId] - Review a report (approve/reject/mark reviewed)
 * Body: { status, reviewComment? }  (a comment is required when rejecting)
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { reportId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      // Head RO reviews any report; an SRO only reports from their own team.
      const { role, userId } = authReq.user;
      if (role !== "head-ro" && role !== "developer") {
        if (role !== "sro") throw new AuthorizationError();
        const existing = await getReportById(reportId);
        if (!existing) throw new NotFoundError("Report not found");
        if (!(await isInManagerChain(userId, existing.submittedBy))) {
          throw new AuthorizationError("You can only review reports from your own team");
        }
      }

      const { status, reviewComment } = updateReportStatusSchema.parse(await req.json());

      const report = await updateReportStatus(reportId, status, authReq.user.userId, reviewComment);

      return apiSuccess(report);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * PUT /api/reports/[reportId] - The submitter edits a returned (rejected) report and
 * sends it back for review. Body: the same as POST /api/reports.
 * A developer in a portal (?sroId= / ?roId= / ?youthLeaderId=) resubmits as that person.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const { reportId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const validatedData = createReportSchema.parse(await req.json());
      const submitterId = (await resolveActingAs(authReq.user, authReq)).userId;
      await requireOwnAttachments(validatedData.content.attachments ?? [], submitterId);

      const report = await resubmitReport(
        reportId,
        {
          ...validatedData,
          period: {
            startDate: new Date(validatedData.period.startDate),
            endDate: new Date(validatedData.period.endDate),
          },
        },
        submitterId,
        authReq.user.userId
      );
      return apiSuccess(report);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * DELETE /api/reports/[reportId] - Delete a report
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { reportId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      if (authReq.user.role !== "head-ro" && authReq.user.role !== "developer") {
        throw new AuthorizationError();
      }

      await deleteReport(reportId, authReq.user.userId);

      return apiSuccess({ message: "Report deleted successfully" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
