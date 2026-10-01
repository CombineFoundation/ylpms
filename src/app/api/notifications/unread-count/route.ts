import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUnreadNotificationCount } from "@/services/notification.service";
import { handleError } from "@/utils/errors";

/**
 * GET /api/notifications/unread-count - Unread notification count for the topbar badge
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json(handleError(new Error("Unauthorized")), { status: 401 });
    }

    const count = await getUnreadNotificationCount(req.user.userId);

    return NextResponse.json({ success: true, data: { count } }, { status: 200 });
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 });
  }
});
