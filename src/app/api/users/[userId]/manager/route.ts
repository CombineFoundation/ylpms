import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUserById, setUsersManager } from "@/services/user.service";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { requireRole } from "@/utils/auth";
import { requireCanManageUser, requireUserChainAccess } from "@/utils/authorization";
import { setManagerSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * PUT /api/users/[userId]/manager - Move one user under a different manager
 * Body: { managerId: string | null }  (null = unassign)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      requireRole(authReq.user.role, ["ro", "sro", "head-ro"]);

      const user = await getUserById(userId);
      if (!user) throw new NotFoundError("User not found");
      await requireCanManageUser(authReq.user, user);

      const { managerId } = setManagerSchema.parse(await req.json());
      if (managerId) {
        const manager = await getUserById(managerId);
        if (!manager) throw new NotFoundError("Manager not found");
        await requireUserChainAccess(authReq.user, manager);
      }

      await setUsersManager([userId], managerId, authReq.user.userId);

      return apiSuccess(await getUserById(userId));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
