import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { assignUsersToManager } from "@/services/user.service";
import { handleError, ValidationError, AuthorizationError } from "@/utils/errors";
import { requireRole } from "@/utils/auth";

/**
 * POST /api/users/[userId]/assign - Assign users to a manager
 */
export async function POST(
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

      // Only managers can assign users
      requireRole(authReq.user.role, ["ro", "sro", "head-ro"]);

      const body = await req.json();
      const { userIds } = body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new ValidationError("userIds must be a non-empty array");
      }

      await assignUsersToManager(params.userId, userIds, authReq.user.userId);

      return NextResponse.json(
        {
          success: true,
          data: { message: "Users assigned successfully" },
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
