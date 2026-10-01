import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUsersReportingTo } from "@/services/user.service";
import { AuthenticationError } from "@/utils/errors";
import { requireRole } from "@/utils/auth";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/users/[userId]/reports - Get users reporting to manager
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      // Users can see their own direct reports; anyone else's requires Head RO.
      if (authReq.user.userId !== userId) {
        requireRole(authReq.user.role, "head-ro");
      }

      return apiSuccess(await getUsersReportingTo(userId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
