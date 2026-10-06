import { withAuth } from "@/middleware/auth.middleware";
import { getTeamReports } from "@/services/team.service";
import { resolveROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/ro/reports - Reports submitted by the RO's youth leaders, which the RO reviews
 * (PATCH /api/reports/[reportId]). The RO's own reports come from GET /api/reports.
 * A developer passes ?roId= to view a specific RO's team.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getTeamReports(await resolveROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
