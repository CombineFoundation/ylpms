import { withAuth } from "@/middleware/auth.middleware";
import { getSROAssignedROs } from "@/services/sro.service";
import { resolveSROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/sro/ros - The signed-in SRO's ROs, with team size, tasks, reports and performance.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getSROAssignedROs(await resolveSROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
