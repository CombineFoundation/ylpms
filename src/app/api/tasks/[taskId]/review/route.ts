import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getTaskById, reviewTask } from "@/services/task.service";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors";
import { reviewTaskSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ taskId: string }> };

/**
 * POST /api/tasks/[taskId]/review - The assigner reviews submitted work.
 * Body: { decision: "accept", note? } | { decision: "request-changes", note }
 * Head RO and developers can review any task (as its assigner).
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const task = await getTaskById(taskId);
      if (!task) throw new NotFoundError("Task not found");

      const isOrgWide = authReq.user.role === "head-ro" || authReq.user.role === "developer";
      if (!isOrgWide && authReq.user.userId !== task.assignedBy) {
        throw new AuthorizationError("Only the person who assigned this task can review it");
      }

      const input = reviewTaskSchema.parse(await req.json());
      return apiSuccess(await reviewTask(taskId, input, task.assignedBy, authReq.user.userId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
