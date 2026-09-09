import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUsers, createUser } from "@/services/user.service";
import { requireRole } from "@/utils/auth";
import { handleError, ValidationError } from "@/utils/errors";
import { createUserSchema } from "@/utils/validation";

/**
 * GET /api/users - Get all users with optional filters
 * GET /api/users?role=ro&status=active&pageSize=10&pageNumber=1
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json(handleError(new Error("Unauthorized")), {
        status: 401,
      });
    }

    // Only allow ro and above to see other users
    requireRole(req.user.role, ["ro", "sro", "head-ro"]);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const reportingToId = searchParams.get("reportingToId");
    const pageSize = searchParams.get("pageSize");
    const pageNumber = searchParams.get("pageNumber");

    // Get users with filters
    const users = await getUsers({
      role: (role as any) || undefined,
      status: (status as any) || undefined,
      reportingToId: reportingToId || undefined,
      pageSize: pageSize ? parseInt(pageSize) : 50,
      pageNumber: pageNumber ? parseInt(pageNumber) : 1,
    });

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
});

/**
 * POST /api/users - Create new user
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json(handleError(new Error("Unauthorized")), {
        status: 401,
      });
    }

    // Only Head RO can create users
    requireRole(req.user.role, "head-ro");

    const body = await req.json();

    // Validate input
    const validatedData = createUserSchema.parse(body);

    const user = await createUser(validatedData, req.user.userId);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(handleError(error), {
      status: (error as any).statusCode || 500,
    });
  }
});
