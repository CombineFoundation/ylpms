import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUserById, setTemporaryPassword } from "@/services/user.service";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { requireRole } from "@/utils/auth";
import { requireCanManageUser } from "@/utils/authorization";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ userId: string }> };

/**
 * POST /api/users/[userId]/temporary-password - sets a new temporary password
 * for someone who has never signed in (their welcome email never arrived) and
 * returns it once, to pass on directly. RO and above, within their own chain.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();
      requireRole(authReq.user.role, "ro");

      const user = await getUserById(userId);
      if (!user) throw new NotFoundError("User not found");
      await requireCanManageUser(authReq.user, user);

      const password = await setTemporaryPassword(userId, authReq.user.userId);
      return apiSuccess({ password });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
