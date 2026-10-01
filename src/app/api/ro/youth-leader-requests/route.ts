import { withAuth } from "@/middleware/auth.middleware";
import { createMemberRequest, getRequestsByRequester } from "@/services/member-request.service";
import { resolveROId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { createYouthLeaderRequestSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/ro/youth-leader-requests - The signed-in RO's requests to add youth leaders, newest first.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getRequestsByRequester("youth-leader", await resolveROId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});

/**
 * POST /api/ro/youth-leader-requests - Ask the RO's SRO to approve a new youth leader.
 * No account is created until the SRO approves it.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const roId = await resolveROId(req.user, req);
    const data = createYouthLeaderRequestSchema.parse(await req.json());

    return apiSuccess(await createMemberRequest("youth-leader", data, roId, req.user.userId), 201);
  } catch (error) {
    return apiError(error);
  }
});
