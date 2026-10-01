import { withAuth } from "@/middleware/auth.middleware";
import { getRequestsForApprover } from "@/services/member-request.service";
import { resolveSROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/sro/youth-leader-requests - Youth leader requests from the SRO's ROs, pending first.
 * Decisions go through PATCH /api/youth-leader-requests/[requestId].
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getRequestsForApprover("youth-leader", await resolveSROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
