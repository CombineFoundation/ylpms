import { withAuth } from "@/middleware/auth.middleware";
import { getVolunteerDashboardSummary } from "@/services/dashboard.service";
import { resolveVolunteerId } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/dashboard/volunteer - The signed-in volunteer's tasks, activities and certificates.
 * A developer passes ?volunteerId= to view a specific volunteer's.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    return apiSuccess(await getVolunteerDashboardSummary(await resolveVolunteerId(req.user, req)));
  } catch (error) {
    return apiError(error);
  }
});
