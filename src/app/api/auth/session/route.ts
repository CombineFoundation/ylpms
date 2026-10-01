import { withAuth } from "@/middleware/auth.middleware";
import { getUserById } from "@/services/user.service";
import { updateDoc } from "@/utils/firestore";
import { apiError, apiSuccess } from "@/utils/api-response";
import { AuthenticationError, logger } from "@/utils/errors";

/**
 * POST /api/auth/session - Called right after client-side sign-in.
 *
 * withAuth has already rejected inactive/suspended accounts (403), so reaching
 * here means the user may sign in. Records the login and promotes a first-time
 * "pending" user to "active", then returns the role the client should route to.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const user = await getUserById(req.user.userId);

    if (user) {
      try {
        await updateDoc("users", user.id, {
          lastLoginAt: new Date(),
          ...(user.status === "pending" || !user.status ? { status: "active" } : {}),
        });
      } catch (error) {
        logger.warn(`Unable to record login for ${user.id}`, error);
      }
    }

    return apiSuccess({
      userId: req.user.userId,
      role: req.user.role,
      name: user?.name || "",
      email: req.user.email,
    });
  } catch (error) {
    return apiError(error);
  }
});
