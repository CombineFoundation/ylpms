import { withAuth } from "@/middleware/auth.middleware";
import { getTeamTasks } from "@/services/team.service";
import { resolveYouthLeaderId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/youth-leader/tasks - Tasks assigned to the youth leader, tasks they assigned to their
 * volunteers, and the volunteers they can assign to. Creating/updating goes through
 * POST /api/tasks and PATCH /api/tasks/[taskId]. A developer passes ?youthLeaderId=.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getTeamTasks(await resolveYouthLeaderId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
