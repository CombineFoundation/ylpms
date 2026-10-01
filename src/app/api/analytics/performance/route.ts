import { withAuth } from "@/middleware/auth.middleware";
import { getPerformanceTree } from "@/services/performance.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/analytics/performance - Overall SRO → RO → Youth Leader → Volunteer
 * performance tree for Head RO (the client drills down without refetching).
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    requireRole(req.user.role, "head-ro");

    return apiSuccess(await getPerformanceTree());
  } catch (error) {
    return apiError(error);
  }
});
