import { withAuth } from "@/middleware/auth.middleware";
import { getSRODashboardSummary } from "@/services/dashboard.service";
import { resolveSROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/dashboard/sro - Dashboard for the signed-in SRO's own team only.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getSRODashboardSummary(await resolveSROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
