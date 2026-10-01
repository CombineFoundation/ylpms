import { withAuth } from "@/middleware/auth.middleware";
import { ANALYTICS_RANGES, getHeadROAnalyticsSummary, type AnalyticsRange } from "@/services/analytics.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/analytics/head-ro?months=3|6|12 - Org-wide analytics summary for Head RO
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    requireRole(req.user.role, "head-ro");

    const requested = Number(new URL(req.url).searchParams.get("months"));
    const months = (ANALYTICS_RANGES as readonly number[]).includes(requested) ? (requested as AnalyticsRange) : 6;

    return apiSuccess(await getHeadROAnalyticsSummary(months));
  } catch (error) {
    return apiError(error);
  }
});
