import { withAuth } from "@/middleware/auth.middleware";
import { getSROYouthLeaders } from "@/services/sro.service";
import { resolveSROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/sro/youth-leaders - Youth leaders under the signed-in SRO's ROs,
 * with their RO, volunteer count, tasks and performance.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getSROYouthLeaders(await resolveSROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
