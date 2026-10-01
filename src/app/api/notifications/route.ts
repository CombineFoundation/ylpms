import { withAuth } from "@/middleware/auth.middleware";
import { getNotificationsForUser } from "@/services/notification.service";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess, parsePagination } from "@/utils/api-response";

/**
 * GET /api/notifications - One page of the current user's notifications, newest first
 * GET /api/notifications?unreadOnly=true&pageSize=25&pageNumber=1
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const { searchParams } = new URL(req.url);

    const page = await getNotificationsForUser(req.user.userId, {
      unreadOnly: searchParams.get("unreadOnly") === "true",
      ...parsePagination(searchParams),
    });

    return apiSuccess(page.items, 200, { page: page.page, pageSize: page.pageSize, hasMore: page.hasMore });
  } catch (error) {
    return apiError(error);
  }
});
