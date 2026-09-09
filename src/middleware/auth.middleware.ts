import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/utils/auth";
import { AuthenticationError, AuthorizationError, handleError } from "@/utils/errors";
import { UserRole } from "@/types/user.types";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const token = extractToken(req.headers.get("authorization") || "");
      const decoded = verifyToken(token);

      // Attach user info to request
      const authReq = req as AuthenticatedRequest;
      authReq.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      return handler(authReq);
    } catch (error) {
      return NextResponse.json(handleError(error), {
        status: error instanceof AuthenticationError ? 401 : 500,
      });
    }
  };
}

/**
 * Middleware to check if user has required role(s)
 */
export function withRole(
  requiredRoles: UserRole | UserRole[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new AuthenticationError("User not authenticated");
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const roleHierarchy: Record<UserRole, number> = {
        "head-ro": 5,
        "sro": 4,
        "ro": 3,
        "youth-leader": 2,
        "volunteer": 1,
      };

      const userLevel = roleHierarchy[req.user.role];
      const hasAccess = roles.some((role) => userLevel >= roleHierarchy[role]);

      if (!hasAccess) {
        throw new AuthorizationError(
          `This action requires ${roles.join(" or ")} role`
        );
      }

      return handler(req);
    } catch (error) {
      const response = handleError(error);
      return NextResponse.json(response, {
        status: error instanceof AuthorizationError ? 403 : 401,
      });
    }
  });
}

/**
 * Wrapper for handling errors in API routes
 */
export async function handleApiRoute<T>(
  handler: (req: NextRequest) => Promise<{ success: true; data: T } | { success: false; error: any }>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const result = await handler(req);

      if (result.success) {
        return NextResponse.json(
          {
            success: true,
            data: result.data,
          },
          { status: 200 }
        );
      } else {
        const errorResponse = handleError(result.error);
        return NextResponse.json(errorResponse, {
          status: errorResponse.error.statusCode || 500,
        });
      }
    } catch (error) {
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, {
        status: errorResponse.error.statusCode || 500,
      });
    }
  };
}
