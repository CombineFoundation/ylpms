import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getEvidenceAttachment } from "@/services/activity.service";
import { reportAttachmentUrl } from "@/services/report-attachment.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ activityId: string; index: string }> };

/**
 * GET /api/activities/[activityId]/evidence/[index] - A short-lived link to one evidence PDF, for the
 * activity's organizer and the people who review it.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { activityId, index } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();
      if (!/^\d+$/.test(index)) throw new NotFoundError("Attachment not found");

      const { attachment, ownerId } = await getEvidenceAttachment(
        activityId,
        Number(index),
        await resolveActingAs(authReq.user, authReq)
      );
      return apiSuccess({ url: await reportAttachmentUrl(attachment, ownerId) });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
