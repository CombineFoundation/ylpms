import { withAuth } from "@/middleware/auth.middleware";
import { getRequestsForApprover } from "@/services/member-request.service";
import { resolveROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/ro/volunteer-requests - Volunteer requests from the RO's youth leaders, pending first.
 * Decisions go through PATCH /api/volunteer-requests/[requestId].
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getRequestsForApprover("volunteer", await resolveROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
