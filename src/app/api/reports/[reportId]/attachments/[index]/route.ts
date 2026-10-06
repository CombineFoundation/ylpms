import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { canViewReport, getReportById } from "@/services/report.service";
import { reportAttachmentUrl } from "@/services/report-attachment.service";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ reportId: string; index: string }> };

/**
 * GET /api/reports/[reportId]/attachments/[index] - A short-lived link to one attached PDF,
 * to anyone who may view the report (submitter, their managers, Head RO).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { reportId, index } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const report = await getReportById(reportId);
      if (!report) throw new NotFoundError("Report not found");
      if (!(await canViewReport(authReq.user, report.submittedBy))) throw new AuthorizationError();

      const attachment = report.content?.attachments?.[Number(index)];
      if (!attachment || !/^\d+$/.test(index)) throw new NotFoundError("Attachment not found");

      return apiSuccess({ url: await reportAttachmentUrl(attachment, report.submittedBy) });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
