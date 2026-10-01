import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { markNotificationRead, deleteNotification } from "@/services/notification.service";
import { handleError } from "@/utils/errors";

/**
 * PATCH /api/notifications/[notificationId] - Mark a notification as read
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) {
        return NextResponse.json(handleError(new Error("Unauthorized")), { status: 401 });
      }

      const notification = await markNotificationRead(notificationId, authReq.user.userId);

      return NextResponse.json({ success: true, data: notification }, { status: 200 });
    } catch (error) {
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 });
    }
  })(req);
}

/**
 * DELETE /api/notifications/[notificationId] - Delete a notification
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) {
        return NextResponse.json(handleError(new Error("Unauthorized")), { status: 401 });
      }

      await deleteNotification(notificationId, authReq.user.userId);

      return NextResponse.json(
        { success: true, data: { message: "Notification deleted successfully" } },
        { status: 200 }
      );
    } catch (error) {
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 });
    }
  })(req);
}
