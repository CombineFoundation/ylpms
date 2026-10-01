import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getEventDetail, updateEvent, deleteEvent } from "@/services/event.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { updateEventSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ eventId: string }> };

/**
 * GET /api/events/[eventId] - One event with the caller's permissions; organizers
 * and reviewers also get attendee / participant names.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      return apiSuccess(await getEventDetail(eventId, await resolveActingAs(authReq.user, authReq)));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * PATCH /api/events/[eventId] - Edit an event's details (while it's a draft, rejected, or planned).
 * Status changes go through POST /api/events/[eventId]/workflow.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const validatedData = updateEventSchema.parse(await req.json());

      const updated = await updateEvent(
        eventId,
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
 * DELETE /api/events/[eventId] - Delete a draft, rejected or cancelled event (Head RO: any event).
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      await deleteEvent(eventId, await resolveActingAs(authReq.user, authReq));

      return apiSuccess({ message: "Event deleted successfully" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
