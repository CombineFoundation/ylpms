import { withAuth } from "@/middleware/auth.middleware";
import { createEvent, listEvents, type EventView } from "@/services/event.service";
import { requireRole } from "@/utils/auth";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError, ValidationError } from "@/utils/errors";
import { createEventSchema } from "@/utils/validation";
import { apiError, apiSuccess, parsePagination } from "@/utils/api-response";

const VIEWS: EventView[] = ["all", "mine", "joined", "review"];

/**
 * GET /api/events - Events with the caller's permissions on each
 * GET /api/events?view=all|mine|joined|review&when=upcoming|past&pageSize=25&pageNumber=1
 *   all (default): one page of upcoming or past events
 *   mine: events the caller organizes · joined: events they signed up for
 *   review: proposals and evidence awaiting the caller's decision
 * A developer in a portal (?roId= / ?youthLeaderId= / ?volunteerId= …) sees it as that person.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const { searchParams } = new URL(req.url);
    const view = (searchParams.get("view") || "all") as EventView;
    if (!VIEWS.includes(view)) throw new ValidationError("Invalid view");
    const when = searchParams.get("when") === "past" ? "past" : "upcoming";

    const page = await listEvents({
      view,
      when,
      actor: await resolveActingAs(req.user, req),
      ...parsePagination(searchParams),
    });

    return apiSuccess(page.items, 200, { page: page.page, pageSize: page.pageSize, hasMore: page.hasMore });
  } catch (error) {
    return apiError(error);
  }
});

/**
 * POST /api/events - Create an event. A youth leader's event starts as a draft
 * (submit it for approval); an RO's or above is scheduled immediately.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const organizer = await resolveActingAs(req.user, req);
    // Volunteers attend events, they don't organize them.
    requireRole(organizer.role, ["youth-leader", "ro", "sro", "head-ro"]);

    const validatedData = createEventSchema.parse(await req.json());

    const event = await createEvent(
      {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
      organizer,
      req.user.userId
    );

    return apiSuccess(event, 201);
  } catch (error) {
    return apiError(error);
  }
});
