import { getDocById } from "@/utils/firestore";
import { AuthorizationError } from "@/utils/errors";
import { roleHierarchy } from "@/utils/auth";
import type { User, UserRole } from "@/types/user.types";

const MAX_CHAIN_DEPTH = 5;

// reportingToId only exists on non-HeadRO members of the User union, so it's
// not part of `keyof User` — use a plain structural type instead of Pick<User, ...>.
type ChainNode = { id: string; reportingToId?: string };

/**
 * Walks up the reportingToId chain from `target`, checking whether `managerId`
 * appears as an ancestor. Bounded to MAX_CHAIN_DEPTH as a safety cap against
 * bad/cyclic data (the real hierarchy is at most 4 hops deep).
 */
export async function isInManagerChain(
  managerId: string,
  target: string | ChainNode
): Promise<boolean> {
  let current: ChainNode | null =
    typeof target === "string" ? await getDocById<User>("users", target) : target;

  for (let depth = 0; depth < MAX_CHAIN_DEPTH; depth++) {
    if (!current || !current.reportingToId) return false;
    if (current.reportingToId === managerId) return true;
    current = await getDocById<User>("users", current.reportingToId);
  }
  return false;
}

/**
 * A caller can access a target user if they own the profile, hold an
 * org-wide role, or are a strictly-higher ancestor in the target's
 * reporting chain (not just a higher rank anywhere in the org).
 */
export async function canAccessUserInChain(
  caller: { userId: string; role: UserRole },
  target: User
): Promise<boolean> {
  if (caller.userId === target.id) return true;
  if (caller.role === "developer" || caller.role === "head-ro") return true;
  if (roleHierarchy[caller.role] <= roleHierarchy[target.role]) return false;
  return isInManagerChain(caller.userId, target);
}

/**
 * Which role a user of each role reports to. SROs report to the Head RO
 * implicitly, so they have no assignable manager.
 */
export const MANAGER_ROLES_FOR: Partial<Record<UserRole, UserRole[]>> = {
  ro: ["sro"],
  "youth-leader": ["ro"],
  volunteer: ["youth-leader", "ro"],
};

/** Manager-side array that lists a direct report of the given role. */
export const MANAGER_FIELD_FOR: Partial<Record<UserRole, "assignedROIds" | "assignedYouthLeaderIds" | "assignedVolunteerIds">> = {
  ro: "assignedROIds",
  "youth-leader": "assignedYouthLeaderIds",
  volunteer: "assignedVolunteerIds",
};

/**
 * Only a developer may create developer/Head RO accounts; everyone else can
 * only create roles strictly below their own.
 */
export function requireCanCreateRole(callerRole: UserRole, targetRole: UserRole): void {
  if (callerRole === "developer") return;
  if (roleHierarchy[callerRole] <= roleHierarchy[targetRole]) {
    throw new AuthorizationError(`You can't create a ${targetRole} account`);
  }
}

/**
 * A caller may manage (edit status/region, reassign, delete) another user only
 * if they rank strictly higher. Developers can manage anyone but themselves;
 * below Head RO the target must also be in the caller's reporting chain.
 */
export async function requireCanManageUser(
  caller: { userId: string; role: UserRole },
  target: User
): Promise<void> {
  if (caller.userId === target.id) {
    throw new AuthorizationError("You can't perform this action on your own account");
  }
  if (caller.role === "developer") return;
  if (roleHierarchy[caller.role] <= roleHierarchy[target.role]) {
    throw new AuthorizationError("You don't have permission to manage users at or above your role");
  }
  if (caller.role === "head-ro") return;
  if (!(await isInManagerChain(caller.userId, target))) {
    throw new AuthorizationError();
  }
}

export async function requireUserChainAccess(
  caller: { userId: string; role: UserRole },
  target: User
): Promise<void> {
  if (!(await canAccessUserInChain(caller, target))) {
    throw new AuthorizationError();
  }
}
