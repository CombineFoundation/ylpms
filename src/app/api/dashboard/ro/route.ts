import { withAuth } from "@/middleware/auth.middleware";
import { getRODashboardSummary } from "@/services/dashboard.service";
import { resolveROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/dashboard/ro - Dashboard for the signed-in RO's team (youth leaders and volunteers).
 * A developer passes ?roId= to view a specific RO's team.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getRODashboardSummary(await resolveROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
