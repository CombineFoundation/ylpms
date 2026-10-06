import { withAuth } from "@/middleware/auth.middleware";
import { getUserById } from "@/services/user.service";
import { cohortAccessFor } from "@/services/cohort.service";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/users/me - Get current user
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const user = await getUserById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    // Youth leaders and volunteers: when their access ends (or ended), for the portal's banner and menu.
    return apiSuccess({ ...user, cohortAccess: await cohortAccessFor(user.role, user.cohortId) });
  } catch (error) {
    return apiError(error);
  }
});
