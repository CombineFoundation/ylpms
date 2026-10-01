import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import {
  canManageTrainingResource,
  deleteTrainingResource,
  getTrainingResourceById,
  updateTrainingResource,
} from "@/services/training.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors";
import { updateTrainingResourceSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ resourceId: string }> };

/**
 * GET /api/training/[resourceId]
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { resourceId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const resource = await getTrainingResourceById(resourceId);
      const canManage = !!resource && canManageTrainingResource(authReq.user, resource);
      // Hide other people's drafts as "not found" rather than 403.
      if (!resource || (!canManage && !resource.published)) {
        throw new NotFoundError("Training resource not found");
      }

      return apiSuccess(resource);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/** Loads the resource and checks the caller may edit/delete it (Head RO: any, SRO: own). */
async function requireManageableResource(caller: { userId: string; role: string }, resourceId: string) {
  const resource = await getTrainingResourceById(resourceId);
  if (!resource) throw new NotFoundError("Training resource not found");
  if (!canManageTrainingResource(caller, resource)) {
    throw new AuthorizationError("You can only change training resources you created");
  }
}

/**
 * PATCH /api/training/[resourceId] - Update (Head RO, or the SRO who created it)
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { resourceId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();
      requireRole(authReq.user.role, "sro");
      await requireManageableResource(authReq.user, resourceId);

      const data = updateTrainingResourceSchema.parse(await req.json());
      return apiSuccess(await updateTrainingResource(resourceId, data, authReq.user.userId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * DELETE /api/training/[resourceId] - Delete (Head RO, or the SRO who created it)
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { resourceId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();
      requireRole(authReq.user.role, "sro");
      await requireManageableResource(authReq.user, resourceId);

      await deleteTrainingResource(resourceId, authReq.user.userId);
      return apiSuccess({ message: "Training resource deleted" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
