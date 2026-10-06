import { withAuth } from "@/middleware/auth.middleware";
import { createMemberRequest, getRequestsByRequester } from "@/services/member-request.service";
import { resolveYouthLeaderId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { createVolunteerRequestSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/youth-leader/volunteer-requests - The youth leader's requests to add volunteers, newest first.
 * A developer passes ?youthLeaderId= to view a specific youth leader's.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getRequestsByRequester("volunteer", await resolveYouthLeaderId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});

/**
 * POST /api/youth-leader/volunteer-requests - Ask the youth leader's RO to approve a new volunteer.
 * No account is created until the RO approves it.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const youthLeaderId = await resolveYouthLeaderId(req.user, req);
    const data = createVolunteerRequestSchema.parse(await req.json());

    return apiSuccess(await createMemberRequest("volunteer", data, youthLeaderId, req.user.userId), 201);
  } catch (error) {
    return apiError(error);
  }
});
