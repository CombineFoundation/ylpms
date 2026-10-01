import { withAuth } from "@/middleware/auth.middleware";
import { getYouthLeaderDashboardSummary } from "@/services/dashboard.service";
import { resolveYouthLeaderId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/dashboard/youth-leader - Dashboard for the signed-in youth leader: their volunteers,
 * tasks, reports and activity pipeline. A developer passes ?youthLeaderId= to view a specific one.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getYouthLeaderDashboardSummary(await resolveYouthLeaderId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
