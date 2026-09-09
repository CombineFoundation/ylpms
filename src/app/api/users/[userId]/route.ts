import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import {
  getUserById,
  updateUser,
  deleteUser,
  getUsersReportingTo,
  assignUsersToManager,
} from "@/services/user.service";
import { updateUserSchema } from "@/utils/validation";
import { requireResourceAccess, requireCanManage, canAccessResource } from "@/utils/auth";
import { handleError, AuthorizationError } from "@/utils/errors";

/**
 * GET /api/users/[userId] - Get specific user
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

      const user = await getUserById(params.userId);

      if (!user) {
        return NextResponse.json(
          handleError(new Error("User not found")),
          { status: 404 }
        );
      }

      // Check if user can access this resource
      if (
        !canAccessResource(
          authReq.user.userId,
          params.userId,
          authReq.user.role,
          user.role
        )
      ) {
        throw new AuthorizationError();
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
  })(req);
}

/**
 * PUT /api/users/[userId] - Update user
 */
export async function PUT(
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

      const body = await req.json();

      // Validate data
      const validatedData = updateUserSchema.parse(body);

      // Get the user to check permissions
      const user = await getUserById(params.userId);
      if (!user) {
        return NextResponse.json(
          handleError(new Error("User not found")),
          { status: 404 }
        );
      }

      // Check permission
      if (
        authReq.user.userId !== params.userId &&
        authReq.user.role !== "head-ro"
      ) {
        throw new AuthorizationError();
      }

      const updatedUser = await updateUser(
        params.userId,
        validatedData,
        authReq.user.userId
      );

      return NextResponse.json(
        {
          success: true,
          data: updatedUser,
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

/**
 * DELETE /api/users/[userId] - Delete user (archive)
 */
export async function DELETE(
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

      // Only Head RO can delete users
      if (authReq.user.role !== "head-ro") {
        throw new AuthorizationError();
      }

      const user = await getUserById(params.userId);
      if (!user) {
        return NextResponse.json(
          handleError(new Error("User not found")),
          { status: 404 }
        );
      }

      await deleteUser(params.userId, authReq.user.userId);

      return NextResponse.json(
        {
          success: true,
          data: { message: "User deleted successfully" },
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
