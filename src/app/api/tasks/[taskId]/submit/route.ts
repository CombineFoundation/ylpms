import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { submitTask } from "@/services/task.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { submitTaskSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ taskId: string }> };

/**
 * POST /api/tasks/[taskId]/submit - The assignee submits their work and completes the task.
 * Body: { note, attachments? }  (PDFs uploaded first via POST /api/reports/attachments)
 * A developer in a portal (?volunteerId= / ?youthLeaderId= …) submits as that person.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const input = submitTaskSchema.parse(await req.json());
      const assignee = await resolveActingAs(authReq.user, authReq);

      return apiSuccess(await submitTask(taskId, input, assignee.userId, authReq.user.userId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
