import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUsersReportingTo } from "@/services/user.service";
import { handleError, AuthorizationError } from "@/utils/errors";

/**
 * GET /api/users/[userId]/reports - Get users reporting to manager
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) {
        return NextResponse.json(handleError(new Error("Unauthorized")), {
          status: 401,
        });
      }

      // User can only see their own reports
      if (
        authReq.user.userId !== params.userId &&
        authReq.user.role !== "head-ro"
      ) {
        throw new AuthorizationError();
      }

      const users = await getUsersReportingTo(params.userId);

      return NextResponse.json(
        {
          success: true,
          data: users,
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(handleError(error), {
        status: (error as any).statusCode || 500,
      });
    }
  })(req);
}
