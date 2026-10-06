import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { withdrawTaskSubmission } from "@/services/task.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ taskId: string }> };

/**
 * POST /api/tasks/[taskId]/withdraw - The assignee takes back a submission before it's
 * reviewed; the task returns to "in progress".
 * A developer in a portal (?volunteerId= / ?youthLeaderId= …) withdraws as that person.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const assignee = await resolveActingAs(authReq.user, authReq);
      return apiSuccess(await withdrawTaskSubmission(taskId, assignee.userId, authReq.user.userId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
