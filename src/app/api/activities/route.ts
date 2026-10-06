import { withAuth } from "@/middleware/auth.middleware";
import { createActivity, listActivities, type ActivityView } from "@/services/activity.service";
import { requireRole } from "@/utils/auth";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError, ValidationError } from "@/utils/errors";
import { createActivitySchema } from "@/utils/validation";
import { apiError, apiSuccess, parsePagination } from "@/utils/api-response";

const VIEWS: ActivityView[] = ["all", "mine", "joined", "review"];

/**
 * GET /api/activities - Activities with the caller's permissions on each
 * GET /api/activities?view=all|mine|joined|review&when=upcoming|past&pageSize=25&pageNumber=1
 *   all (default): one page of upcoming or past activities
 *   mine: activities the caller organizes · joined: activities they signed up for
 *   review: proposals and evidence awaiting the caller's decision
 * A developer in a portal (?roId= / ?youthLeaderId= / ?volunteerId= …) sees it as that person.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const { searchParams } = new URL(req.url);
    const view = (searchParams.get("view") || "all") as ActivityView;
    if (!VIEWS.includes(view)) throw new ValidationError("Invalid view");
    const when = searchParams.get("when") === "past" ? "past" : "upcoming";

    const page = await listActivities({
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
 * POST /api/activities - Create an activity. A youth leader's activity starts as a draft
 * (submit it for approval); an RO's or above is scheduled immediately.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const organizer = await resolveActingAs(req.user, req);
    // Volunteers attend activities, they don't organize them.
    requireRole(organizer.role, ["youth-leader", "ro", "sro", "head-ro"]);

    const validatedData = createActivitySchema.parse(await req.json());

    const activity = await createActivity(
      {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
      organizer,
      req.user.userId
    );

    return apiSuccess(activity, 201);
  } catch (error) {
    return apiError(error);
  }
});
