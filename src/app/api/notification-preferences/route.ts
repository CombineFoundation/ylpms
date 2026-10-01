import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/services/notification.service";
import { updateNotificationPreferencesSchema } from "@/utils/validation";
import { handleError } from "@/utils/errors";

/**
 * GET /api/notification-preferences - Get the current user's notification preferences
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json(handleError(new Error("Unauthorized")), { status: 401 });
    }

    const preferences = await getNotificationPreferences(req.user.userId);

    return NextResponse.json({ success: true, data: preferences }, { status: 200 });
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 });
  }
});

/**
 * PUT /api/notification-preferences - Update the current user's notification preferences
 */
export const PUT = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json(handleError(new Error("Unauthorized")), { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateNotificationPreferencesSchema.parse(body);

    const preferences = await updateNotificationPreferences(req.user.userId, validatedData);

    return NextResponse.json({ success: true, data: preferences }, { status: 200 });
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 });
  }
});
