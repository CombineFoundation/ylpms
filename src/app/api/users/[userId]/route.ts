import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUserById, updateUser, deleteUser, getUserDeletionImpact } from "@/services/user.service";
import { selfUpdateUserSchema, updateUserSchema } from "@/utils/validation";
import { requireCanManageUser, requireUserChainAccess } from "@/utils/authorization";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ userId: string }> };

/**
 * GET /api/users/[userId] - Get specific user
 * GET /api/users/[userId]?include=deletion-impact - also report what deleting them would affect
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { userId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const user = await getUserById(userId);
      if (!user) throw new NotFoundError("User not found");

      await requireUserChainAccess(authReq.user, user);

      if (new URL(authReq.url).searchParams.get("include") === "deletion-impact") {
        await requireCanManageUser(authReq.user, user);
        return apiSuccess({ ...user, deletionImpact: await getUserDeletionImpact(userId) });
      }

      return apiSuccess(user);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * PUT /api/users/[userId] - Update user
 *
 * On your own profile you may change only name/phone/profilePicture (plus
 * deactivating yourself); status and region changes require managing the user.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const { userId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const body = await req.json();

      const user = await getUserById(userId);
      if (!user) throw new NotFoundError("User not found");

      let validatedData;
      if (authReq.user.userId === userId) {
        const { status, ...rest } = body ?? {};
        // Self-service deactivation is the only status change allowed on yourself.
        if (status !== undefined && status !== "inactive") {
          throw new AuthorizationError("You can't change your own account status");
        }
        validatedData = {
          ...selfUpdateUserSchema.strict().parse(rest),
          ...(status === "inactive" ? { status: "inactive" as const } : {}),
        };
      } else {
        await requireCanManageUser(authReq.user, user);
        validatedData = updateUserSchema.strict().parse(body);
      }

      const updatedUser = await updateUser(userId, validatedData, authReq.user.userId);

      return apiSuccess(updatedUser);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * DELETE /api/users/[userId] - Permanently delete user document
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { userId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      // Only Head RO / developer can delete users
      if (authReq.user.role !== "head-ro" && authReq.user.role !== "developer") {
        throw new AuthorizationError();
      }

      const user = await getUserById(userId);
      if (!user) throw new NotFoundError("User not found");

      // Blocks deleting yourself and anyone at or above your own role.
      await requireCanManageUser(authReq.user, user);

      await deleteUser(userId, authReq.user.userId);

      return apiSuccess({ message: "User deleted successfully" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
