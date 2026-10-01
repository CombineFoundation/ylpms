import { withAuth } from "@/middleware/auth.middleware";
import { listCohorts, startNewCohort, toApiCohort } from "@/services/cohort.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError } from "@/utils/errors";
import { startCohortSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

/** GET /api/cohorts - Every cohort, newest (current) first. Head RO only. */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();
    requireRole(req.user.role, "head-ro");

    const now = new Date();
    return apiSuccess((await listCohorts()).map((cohort) => toApiCohort(cohort, now)));
  } catch (error) {
    return apiError(error);
  }
});

/** POST /api/cohorts - Start the next cohort, once the current one has ended. Body: { startDate, endDate } as YYYY-MM-DD. */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();
    requireRole(req.user.role, "head-ro");

    const data = startCohortSchema.parse(await req.json());
    return apiSuccess(toApiCohort(await startNewCohort(data, req.user.userId)), 201);
  } catch (error) {
    return apiError(error);
  }
});
