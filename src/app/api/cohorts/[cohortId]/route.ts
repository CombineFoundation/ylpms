import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { toApiCohort, updateCohortFigures } from "@/services/cohort.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError } from "@/utils/errors";
import { updateCohortFiguresSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ cohortId: string }> };

/** PATCH /api/cohorts/[cohortId] - Set the figures the system can't count (digital reach, partnerships). Head RO only. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { cohortId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();
      requireRole(authReq.user.role, "head-ro");

      const figures = updateCohortFiguresSchema.parse(await req.json());
      return apiSuccess(toApiCohort(await updateCohortFigures(cohortId, figures, authReq.user.userId)));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
