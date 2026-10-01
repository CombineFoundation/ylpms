import { withAuth } from "@/middleware/auth.middleware";
import { getHeadRODashboardSummary } from "@/services/dashboard.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/dashboard/head-ro - Org-wide dashboard summary for Head RO
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    requireRole(req.user.role, "head-ro");

    return apiSuccess(await getHeadRODashboardSummary(req.user.userId));
  } catch (error) {
    return apiError(error);
  }
});
