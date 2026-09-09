import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUserById } from "@/services/user.service";
import { handleError } from "@/utils/errors";

/**
 * GET /api/users/me - Get current user
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json(handleError(new Error("Unauthorized")), {
        status: 401,
      });
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      return NextResponse.json(
        handleError(new Error("User not found")),
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(handleError(error), {
      status: (error as any).statusCode || 500,
    });
  }
});
