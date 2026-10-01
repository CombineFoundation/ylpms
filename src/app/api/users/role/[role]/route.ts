import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getUsersByRole } from "@/services/user.service";
import { AuthenticationError, ValidationError } from "@/utils/errors";
import { requireRole } from "@/utils/auth";
import { apiError, apiSuccess } from "@/utils/api-response";
import { UserRole } from "@/types/user.types";

const VALID_ROLES: UserRole[] = ["developer", "head-ro", "sro", "ro", "youth-leader", "volunteer"];

/**
 * GET /api/users/role/[role] - Get users by role
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      if (!VALID_ROLES.includes(role as UserRole)) {
        throw new ValidationError("Invalid role");
      }

      // Caller's rank must be at or above the role being queried
      requireRole(authReq.user.role, role as UserRole);

      const isOrgWide = authReq.user.role === "head-ro" || authReq.user.role === "developer";
      const users = await getUsersByRole(
        role as UserRole,
        isOrgWide ? undefined : authReq.user.userId
      );

      return apiSuccess(users);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
