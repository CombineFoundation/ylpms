import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import {
  canViewReport,
  getReportById,
  updateReportStatus,
  deleteReport,
  enrichReportsForList,
} from "@/services/report.service";
import { isInManagerChain } from "@/utils/authorization";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors";
import { updateReportStatusSchema } from "@/utils/validation";
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

      const [enriched] = await enrichReportsForList([report]);
      return apiSuccess(enriched);
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
