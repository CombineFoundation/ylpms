import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getTaskById } from "@/services/task.service";
import { getUserById } from "@/services/user.service";
import { reportAttachmentUrl } from "@/services/report-attachment.service";
import { canAccessUserInChain } from "@/utils/authorization";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ taskId: string; index: string }> };

/**
 * GET /api/tasks/[taskId]/attachments/[index] - A short-lived link to one PDF from a task's submission,
 * to the assignee, the assigner, anyone above the assignee in their chain, and Head RO.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { taskId, index } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();
      if (!/^\d+$/.test(index)) throw new NotFoundError("Attachment not found");

      const task = await getTaskById(taskId);
      if (!task) throw new NotFoundError("Task not found");

      const caller = authReq.user;
      if (caller.userId !== task.assignedTo && caller.userId !== task.assignedBy) {
        const assignee = await getUserById(task.assignedTo);
        if (!assignee || !(await canAccessUserInChain(caller, assignee))) throw new AuthorizationError();
      }

      const attachment = task.submission?.attachments?.[Number(index)];
      if (!attachment) throw new NotFoundError("Attachment not found");

      return apiSuccess({ url: await reportAttachmentUrl(attachment, task.assignedTo) });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
