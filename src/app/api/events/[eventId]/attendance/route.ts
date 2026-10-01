import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { setEventAttendance } from "@/services/event.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { eventAttendanceSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ eventId: string }> };

/**
 * POST /api/events/[eventId]/attendance - Sign up for, or withdraw from, an approved event.
 * Body: { action: "join" | "leave" }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const { action } = eventAttendanceSchema.parse(await req.json());
      const event = await setEventAttendance(eventId, action === "join", await resolveActingAs(authReq.user, authReq));

      return apiSuccess({ attendeeCount: event.attendees.length });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
