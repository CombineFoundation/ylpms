import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { canManageTrainingResource, getTrainingResourceById } from "@/services/training.service";
import { trainingFileUrl } from "@/services/training-file.service";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ resourceId: string }> };

/**
 * GET /api/training/[resourceId]/file - A short-lived link to a resource's uploaded file, for anyone who can
 * see the resource (every role for published ones; drafts only to people who manage them).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { resourceId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const resource = await getTrainingResourceById(resourceId);
      if (!resource || (!resource.published && !canManageTrainingResource(authReq.user, resource))) {
        throw new NotFoundError("Training resource not found");
      }
      if (!resource.file) throw new NotFoundError("This resource has no uploaded file");

      return apiSuccess({ url: await trainingFileUrl(resource.file) });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
