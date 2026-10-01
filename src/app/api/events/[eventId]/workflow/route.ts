import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { runEventWorkflow } from "@/services/event.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { eventWorkflowSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ eventId: string }> };

/**
 * POST /api/events/[eventId]/workflow - Move an event through the activity workflow.
 * Body: { action: "submit" | "approve" | "reject" | "start" | "submit-evidence" |
 *         "return-evidence" | "verify" | "cancel", comment?, evidence? }
 * Rejecting and returning evidence need a comment; submit-evidence needs
 * { summary, participantIds, attachments }. Verifying issues the certificates.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const input = eventWorkflowSchema.parse(await req.json());
      const actor = await resolveActingAs(authReq.user, authReq);

      return apiSuccess(await runEventWorkflow(eventId, input, actor, authReq.user.userId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
