import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  AccountDisabledError,
  AuthenticationError,
  AuthorizationError,
  handleError,
} from "@/utils/errors";
import { UserRole, UserStatus } from "@/types/user.types";
import { cohortAccessError } from "@/services/cohort.service";

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
      const authorization = req.headers.get("authorization") || "";
      const [scheme, token] = authorization.split(" ");
      if (scheme?.toLowerCase() !== "bearer" || !token) {
        throw new AuthenticationError("Missing or invalid authorization header");
      }

      const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
      const profileSnapshot = await getFirebaseAdminDb()
        .collection("users")
        .doc(decoded.uid)
        .get();
      const profile = profileSnapshot.data() as { role?: UserRole; status?: UserStatus; cohortId?: string } | undefined;
      // The Firestore profile is the source of truth; custom claims can be stale
      // after a role change until the user's token refreshes.
      const role = profile?.role || decoded.role;

      if (!role) {
        throw new AuthenticationError("User profile is missing a role");
      }

      if (profile?.status && BLOCKED_STATUSES.has(profile.status)) {
        // 403, not 401: the token is valid, the account just isn't allowed in.
        throw new AccountDisabledError(
          profile.status === "suspended"
            ? "Your account has been suspended. Contact your administrator."
            : "Your account has been deactivated. Contact your administrator."
        );
      }

      // Youth leaders and volunteers can only sign in while their cohort runs.
      const cohortError = await cohortAccessError(role, profile?.cohortId);
      if (cohortError) throw new AccountDisabledError(cohortError);

      // Attach user info to request
      const authReq = req as AuthenticatedRequest;
      authReq.user = {
        userId: decoded.uid,
        email: decoded.email || "",
        role,
      };
    } catch (error) {
      const normalizedError = normalizeAuthError(error);
      const response = handleError(normalizedError);
      return NextResponse.json(response, { status: response.error.statusCode || 500 });
    }

    // Awaited outside the auth try/catch so handler errors are reported with
    // their own status instead of being mistaken for auth failures.
    try {
      return await handler(req as AuthenticatedRequest);
    } catch (error) {
      const response = handleError(error);
      return NextResponse.json(response, { status: response.error.statusCode || 500 });
    }
  };
}

const BLOCKED_STATUSES = new Set<UserStatus>(["inactive", "suspended"]);

/**
 * The Firebase Admin SDK throws its own error classes (not our AuthenticationError)
 * for an expired/revoked/invalid ID token — e.g. `verifyIdToken()` rejecting with
 * code "auth/id-token-expired". Left alone, that error is neither recognized here
 * as an auth failure (so it 500s instead of 401s) nor caught by the client's
 * expired-session handling (which watches for 401), and its raw message — meant
 * for server logs — leaks straight to the browser. Normalize any Firebase Auth
 * SDK error into our AuthenticationError so both behave correctly.
 */
function normalizeAuthError(error: unknown): unknown {
  if (error instanceof AuthenticationError) return error;

  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === "string" && code.startsWith("auth/")) {
    return new AuthenticationError("Your session has expired. Please sign in again.");
  }

  return error;
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
        developer: 6,
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

      return await handler(req);
    } catch (error) {
      const response = handleError(error);
      return NextResponse.json(response, { status: response.error.statusCode || 500 });
    }
  });
}

/**
 * Wrapper for handling errors in API routes
 */
export async function handleApiRoute<T>(
  handler: (req: NextRequest) => Promise<{ success: true; data: T } | { success: false; error: unknown }>
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
