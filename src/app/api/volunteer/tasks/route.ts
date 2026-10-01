import { withAuth } from "@/middleware/auth.middleware";
import { getTeamTasks } from "@/services/team.service";
import { resolveVolunteerId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/volunteer/tasks - Tasks assigned to the volunteer (`assignedToMe`); progress updates
 * go through PATCH /api/tasks/[taskId]. A developer passes ?volunteerId=.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getTeamTasks(await resolveVolunteerId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
