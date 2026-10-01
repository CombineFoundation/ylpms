import { withAuth } from "@/middleware/auth.middleware";
import { getTeamReports } from "@/services/team.service";
import { resolveSROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/sro/reports - Reports submitted by anyone in the signed-in SRO's team.
 * Review decisions go through PATCH /api/reports/[reportId].
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getTeamReports(await resolveSROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
