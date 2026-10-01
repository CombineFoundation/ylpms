import { withAuth } from "@/middleware/auth.middleware";
import { getTeamVolunteers } from "@/services/team.service";
import { resolveYouthLeaderId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/youth-leader/volunteers - The youth leader's volunteers with task stats.
 * A developer passes ?youthLeaderId= to view a specific youth leader's team.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getTeamVolunteers(await resolveYouthLeaderId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
