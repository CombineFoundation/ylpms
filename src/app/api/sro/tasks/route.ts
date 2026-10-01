import { withAuth } from "@/middleware/auth.middleware";
import { getTeamTasks } from "@/services/team.service";
import { resolveSROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/sro/tasks - Tasks assigned to the signed-in SRO, tasks they assigned,
 * and the team members they can assign to. Creating/updating still goes
 * through POST /api/tasks and PATCH /api/tasks/[taskId].
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getTeamTasks(await resolveSROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
