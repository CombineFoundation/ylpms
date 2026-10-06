import { withAuth } from "@/middleware/auth.middleware";
import { getLeaderboard } from "@/services/leaderboard.service";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/leaderboard - The current cohort's youth leaders and volunteers,
 * ranked with tiers. Open to every signed-in role.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();
    return apiSuccess(await getLeaderboard());
  } catch (error) {
    return apiError(error);
  }
});
