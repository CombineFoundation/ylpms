import { withAuth } from "@/middleware/auth.middleware";
import { getUserById } from "@/services/user.service";
import { createActivityLog } from "@/services/activitylog.service";
import { updateDoc } from "@/utils/firestore";
import { apiError, apiSuccess } from "@/utils/api-response";
import { AuthenticationError } from "@/utils/errors";

/**
 * POST /api/auth/password-changed - Called after the user changed their own
 * password in the browser (Firebase Auth). Lifts the first-sign-in block that
 * withAuth puts on accounts still using their emailed temporary password.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const user = await getUserById(req.user.userId);
    if (user?.mustChangePassword) {
      await updateDoc("users", user.id, { mustChangePassword: null });
      await createActivityLog({
        userId: user.id,
        action: "user-updated",
        description: "Replaced the temporary password",
        entityType: "user",
        entityId: user.id,
      });
    }

    return apiSuccess({ mustChangePassword: false });
  } catch (error) {
    return apiError(error);
  }
});
