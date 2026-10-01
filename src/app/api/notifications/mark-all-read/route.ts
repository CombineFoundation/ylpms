import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { markAllNotificationsRead } from "@/services/notification.service";
import { handleError } from "@/utils/errors";

/**
 * POST /api/notifications/mark-all-read - Mark every unread notification as read
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json(handleError(new Error("Unauthorized")), { status: 401 });
    }

    await markAllNotificationsRead(req.user.userId);

    return NextResponse.json(
      { success: true, data: { message: "All notifications marked as read" } },
      { status: 200 }
    );
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 });
  }
});
