import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { assignUsersToManager, getUserById } from "@/services/user.service";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { requireRole } from "@/utils/auth";
import { requireCanManageUser, requireUserChainAccess } from "@/utils/authorization";
import { assignUsersSchema } from "@/utils/validation";
import { getDocsByIds } from "@/utils/firestore";
import { apiError, apiSuccess } from "@/utils/api-response";
import type { User } from "@/types/user.types";

/**
 * POST /api/users/[userId]/assign - Assign users to a manager
 * Body: { userIds: string[] }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: managerId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      // Only managers can assign users
      requireRole(authReq.user.role, ["ro", "sro", "head-ro"]);

      const manager = await getUserById(managerId);
      if (!manager) {
        throw new NotFoundError("Manager not found");
      }
      await requireUserChainAccess(authReq.user, manager);

      const { userIds } = assignUsersSchema.parse(await req.json());

      // The caller must also be allowed to manage every user being moved.
      const users = await getDocsByIds<User>("users", userIds);
      for (const user of users) {
        await requireCanManageUser(authReq.user, user);
      }

      // Role pairing + previous-manager cleanup are enforced in the service.
      await assignUsersToManager(managerId, userIds, authReq.user.userId);

      return apiSuccess({ message: "Users assigned successfully" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
