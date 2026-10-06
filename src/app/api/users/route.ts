import { withAuth } from "@/middleware/auth.middleware";
import { getUsers, createUser, enrichUsersForList } from "@/services/user.service";
import { requireIdNotRequested } from "@/services/member-request.service";
import { requireRole } from "@/utils/auth";
import { requireCanCreateRole } from "@/utils/authorization";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/utils/errors";
import { createUserSchema } from "@/utils/validation";
import { apiError, apiSuccess, parsePagination } from "@/utils/api-response";
import type { UserRole, UserStatus } from "@/types/user.types";

const ROLES: UserRole[] = ["developer", "head-ro", "sro", "ro", "youth-leader", "volunteer"];
const STATUSES: UserStatus[] = ["active", "inactive", "suspended", "pending"];

/**
 * GET /api/users - One page of users, with manager name + direct-report count
 * GET /api/users?role=ro&status=active&reportingToId=abc&unassigned=true&pageSize=25&pageNumber=1
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    // Only allow ro and above to see other users
    requireRole(req.user.role, ["ro", "sro", "head-ro"]);

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status") as UserStatus | null;
    if (role && !ROLES.includes(role)) throw new ValidationError("Invalid role filter");
    if (status && !STATUSES.includes(status)) throw new ValidationError("Invalid status filter");

    // Non-org-wide roles can only ever list their own direct reports
    const isOrgWide = req.user.role === "head-ro" || req.user.role === "developer";
    let reportingToId = searchParams.get("reportingToId") || undefined;
    const unassigned = isOrgWide && searchParams.get("unassigned") === "true";
    if (!isOrgWide) {
      if (reportingToId && reportingToId !== req.user.userId) {
        throw new AuthorizationError();
      }
      reportingToId = req.user.userId;
    }

    const page = await getUsers({
      role: role || undefined,
      status: status || undefined,
      reportingToId,
      unassigned,
      ...parsePagination(searchParams),
    });

    const users = await enrichUsersForList(page.items);

    return apiSuccess(users, 200, { page: page.page, pageSize: page.pageSize, hasMore: page.hasMore });
  } catch (error) {
    return apiError(error);
  }
});

/**
 * POST /api/users - Create new user
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    // Only Head RO (and developer) can create users
    requireRole(req.user.role, "head-ro");

    const validatedData = createUserSchema.parse(await req.json());

    // A Head RO can't mint developer or other Head RO accounts.
    requireCanCreateRole(req.user.role, validatedData.role);
    // The ID mustn't be one a pending youth leader / volunteer request is waiting on.
    if (validatedData.memberId) await requireIdNotRequested(validatedData.memberId);

    const user = await createUser(validatedData, req.user.userId);

    return apiSuccess(user, 201);
  } catch (error) {
    return apiError(error);
  }
});
