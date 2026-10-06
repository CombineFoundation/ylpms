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
 * Head RO can review any task except monthly tasks (their RO does); developers can review any task.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const task = await getTaskById(taskId);
      if (!task) throw new NotFoundError("Task not found");

      // Monthly tasks are reviewed only by the youth leader's RO (their assigner); Head RO just views them.
      const canOverride = authReq.user.role === "developer" || (authReq.user.role === "head-ro" && !task.monthlyCycle);
      if (!canOverride && authReq.user.userId !== task.assignedBy) {
        throw new AuthorizationError(
          task.monthlyCycle
            ? "Monthly tasks are reviewed by the youth leader's RO"
            : "Only the person who assigned this task can review it"
        );
      }

      const input = reviewTaskSchema.parse(await req.json());
      return apiSuccess(await reviewTask(taskId, input, task.assignedBy, authReq.user.userId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
