import { withAuth } from "@/middleware/auth.middleware";
import { assignMonthlyTasks, getMonthlyTaskStatus } from "@/services/monthly-task.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/tasks/monthly - This program month's task lists and whether everyone in the
 * caller's scope (Head RO: everyone; SRO / RO: their team) already has them.
 * A developer in the SRO/RO portal (?sroId= / ?roId=) sees that person's scope.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getMonthlyTaskStatus(await resolveActingAs(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});

/**
 * POST /api/tasks/monthly - Assign this month's tasks to every active/idle person in the
 * caller's scope who doesn't have them yet (due the next 15th unless a task sets its own date).
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await assignMonthlyTasks(await resolveActingAs(req.user, req), req.user.userId), 201);
  } catch (error) {
    return apiError(error);
  }
});
