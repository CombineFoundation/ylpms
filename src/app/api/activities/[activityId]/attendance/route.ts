import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { setActivityAttendance } from "@/services/activity.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { activityAttendanceSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ activityId: string }> };

/**
 * POST /api/activities/[activityId]/attendance - Sign up for, or withdraw from, an approved activity.
 * Body: { action: "join" | "leave" }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { activityId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const { action } = activityAttendanceSchema.parse(await req.json());
      const activity = await setActivityAttendance(activityId, action === "join", await resolveActingAs(authReq.user, authReq));

      return apiSuccess({ attendeeCount: activity.attendees.length });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
