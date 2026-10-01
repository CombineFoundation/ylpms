import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { reviewMemberRequest, withdrawMemberRequest } from "@/services/member-request.service";
import { AuthenticationError } from "@/utils/errors";
import { reviewMemberRequestSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ requestId: string }> };

/**
 * PATCH /api/youth-leader-requests/[requestId] - SRO approves or rejects.
 * Body: { decision: "approved" | "rejected", comment? }  (a comment is required when rejecting)
 * Approving creates the youth leader under the requesting RO and emails their credentials.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { requestId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const { decision, comment, memberId } = reviewMemberRequestSchema.parse(await req.json());
      return apiSuccess(await reviewMemberRequest("youth-leader", requestId, decision, authReq.user, comment, memberId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * DELETE /api/youth-leader-requests/[requestId] - The requesting RO withdraws a pending request.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { requestId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      await withdrawMemberRequest("youth-leader", requestId, authReq.user);
      return apiSuccess({ message: "Request withdrawn" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
