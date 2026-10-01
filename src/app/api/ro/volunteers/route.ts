import { withAuth } from "@/middleware/auth.middleware";
import { getTeamVolunteers } from "@/services/team.service";
import { resolveROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/ro/volunteers - Every volunteer under the RO, with the youth leader they report to.
 * A developer passes ?roId= to view a specific RO's team.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getTeamVolunteers(await resolveROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
