import { jwtDecode } from "jwt-decode";
import { AuthenticationError, AuthorizationError } from "./errors";
import { UserRole } from "@/types/user.types";

export interface DecodedToken {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Role hierarchy for permission checking
const roleHierarchy: Record<UserRole, number> = {
  "head-ro": 5,
  "sro": 4,
  "ro": 3,
  "youth-leader": 2,
  "volunteer": 1,
};

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): DecodedToken {
  try {
    if (!token) {
      throw new AuthenticationError("No token provided");
    }

    const decoded = jwtDecode<DecodedToken>(token);

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      throw new AuthenticationError("Token has expired");
    }

    return decoded;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError("Invalid token");
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string {
  if (!authHeader) {
    throw new AuthenticationError("Missing authorization header");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new AuthenticationError("Invalid authorization header format");
  }

  return parts[1];
}

/**
 * Check if a role has permission to access a resource
 */
export function checkRoleAccess(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const userRoleLevel = roleHierarchy[userRole];

  // User's role must be equal or higher in hierarchy
  return requiredRoles.some((role) => userRoleLevel >= roleHierarchy[role]);
}

/**
 * Check if user can perform action on another user
 */
export function canManageUser(
  managerRole: UserRole,
  targetRole: UserRole
): boolean {
  // A role can only manage users with equal or lower hierarchy
  return roleHierarchy[managerRole] >= roleHierarchy[targetRole];
}

/**
 * Verify user owns resource or is supervisor
 */
export function canAccessResource(
  userId: string,
  resourceOwnerId: string,
  userRole: UserRole,
  ownerRole?: UserRole
): boolean {
  // User owns the resource
  if (userId === resourceOwnerId) {
    return true;
  }

  // Supervisor/manager can access subordinate's resources
  if (ownerRole) {
    return roleHierarchy[userRole] > roleHierarchy[ownerRole];
  }

  return false;
}

/**
 * Throw authorization error if check fails
 */
export function requireRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): void {
  if (!checkRoleAccess(userRole, requiredRole)) {
    throw new AuthorizationError(
      `This action requires ${Array.isArray(requiredRole) ? requiredRole.join(" or ") : requiredRole} role`
    );
  }
}

/**
 * Throw authorization error if user cannot manage target user
 */
export function requireCanManage(managerRole: UserRole, targetRole: UserRole): void {
  if (!canManageUser(managerRole, targetRole)) {
    throw new AuthorizationError(
      "You don't have permission to manage users with a higher role"
    );
  }
}

/**
 * Throw authorization error if user cannot access resource
 */
export function requireResourceAccess(
  userId: string,
  resourceOwnerId: string,
  userRole: UserRole,
  ownerRole?: UserRole
): void {
  if (!canAccessResource(userId, resourceOwnerId, userRole, ownerRole)) {
    throw new AuthorizationError("You don't have permission to access this resource");
  }
}
