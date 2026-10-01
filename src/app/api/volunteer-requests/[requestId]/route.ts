import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { reviewMemberRequest, withdrawMemberRequest } from "@/services/member-request.service";
import { AuthenticationError } from "@/utils/errors";
import { reviewMemberRequestSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ requestId: string }> };

/**
 * PATCH /api/volunteer-requests/[requestId] - The youth leader's RO approves or rejects.
 * Body: { decision: "approved" | "rejected", comment? }  (a comment is required when rejecting)
 * Approving creates the volunteer under the requesting youth leader and emails their credentials.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { requestId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const { decision, comment, memberId } = reviewMemberRequestSchema.parse(await req.json());
      return apiSuccess(await reviewMemberRequest("volunteer", requestId, decision, authReq.user, comment, memberId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * DELETE /api/volunteer-requests/[requestId] - The requesting youth leader withdraws a pending request.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { requestId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      await withdrawMemberRequest("volunteer", requestId, authReq.user);
      return apiSuccess({ message: "Request withdrawn" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
