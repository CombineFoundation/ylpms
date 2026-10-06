import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUserById, sendPasswordReset } from "@/services/user.service";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { requireRole } from "@/utils/auth";
import { requireCanManageUser } from "@/utils/authorization";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ userId: string }> };

/**
 * POST /api/users/[userId]/password-reset - Head RO emails a user a link to set
 * a new password (e.g. their welcome email never arrived). Head RO / developer only.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();
      requireRole(authReq.user.role, "head-ro");

      const user = await getUserById(userId);
      if (!user) throw new NotFoundError("User not found");
      await requireCanManageUser(authReq.user, user);

      await sendPasswordReset(userId, authReq.user.userId);
      return apiSuccess({ message: `A password reset link was emailed to ${user.email}.` });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
