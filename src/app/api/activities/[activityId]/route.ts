import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getActivityDetail, updateActivity, deleteActivity } from "@/services/activity.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { updateActivitySchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ activityId: string }> };

/**
 * GET /api/activities/[activityId] - One activity with the caller's permissions; organizers
 * and reviewers also get attendee / participant names.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { activityId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      return apiSuccess(await getActivityDetail(activityId, await resolveActingAs(authReq.user, authReq)));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * PATCH /api/activities/[activityId] - Edit an activity's details (while it's a draft, rejected, or planned).
 * Status changes go through POST /api/activities/[activityId]/workflow.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { activityId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const validatedData = updateActivitySchema.parse(await req.json());

      const updated = await updateActivity(
        activityId,
        {
          ...validatedData,
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        },
        await resolveActingAs(authReq.user, authReq)
      );

      return apiSuccess(updated);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * DELETE /api/activities/[activityId] - Delete a draft, rejected or cancelled activity (Head RO: any activity).
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { activityId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      await deleteActivity(activityId, await resolveActingAs(authReq.user, authReq));

      return apiSuccess({ message: "Activity deleted successfully" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
