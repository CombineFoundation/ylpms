import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUsersByRole } from "@/services/user.service";
import { handleError } from "@/utils/errors";
import { UserRole } from "@/types/user.types";

/**
 * GET /api/users/role/[role] - Get users by role
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { role: string } }
) {
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) {
        return NextResponse.json(handleError(new Error("Unauthorized")), {
          status: 401,
        });
      }

      const validRoles = ["head-ro", "sro", "ro", "youth-leader", "volunteer"];
      if (!validRoles.includes(params.role)) {
        return NextResponse.json(
          handleError(new Error("Invalid role")),
          { status: 400 }
        );
      }

      const users = await getUsersByRole(params.role as UserRole);

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
