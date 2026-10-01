import { getDocById } from "@/utils/firestore";
import { AuthorizationError, NotFoundError, ValidationError } from "@/utils/errors";
import { SCOPED_ROLES, SCOPE_PARAM, portalNames, type ScopedRole } from "@/utils/portal-scope";
import type { User, UserRole } from "@/types/user.types";

export type { ScopedRole };

/**
 * Whose data a portal request is about. A user of that role always gets
 * their own; a developer (full access to every portal) picks one with
 * `?sroId=` / `?roId=` / `?youthLeaderId=` / `?volunteerId=`.
 */
export async function resolveScopeId(user: { userId: string; role: UserRole }, req: Request, role: ScopedRole): Promise<string> {
  if (user.role === role) return user.userId;
  if (user.role !== "developer") {
    throw new AuthorizationError(`The ${portalNames[role]} portal is only available to ${portalNames[role]} and developer accounts`);
  }

  const targetId = new URL(req.url).searchParams.get(SCOPE_PARAM[role]);
  if (!targetId) throw new ValidationError(`Choose which ${portalNames[role]} to view`);

  const target = await getDocById<User>("users", targetId);
  if (!target || target.role !== role) throw new NotFoundError(`${portalNames[role]} not found`);
  return targetId;
}

/** True when a developer's request names a portal user to act as. */
export function hasScopeParam(req: Request): boolean {
  const params = new URL(req.url).searchParams;
  return SCOPED_ROLES.some((role) => params.has(SCOPE_PARAM[role]));
}

/**
 * For requests made from a portal: a developer passing a scope param acts as
 * that person (so the task/report/event is theirs); everyone else acts as themselves.
 */
export async function resolveActingAs(
  user: { userId: string; role: UserRole },
  req: Request
): Promise<{ userId: string; role: UserRole }> {
  if (user.role !== "developer") return user;
  const params = new URL(req.url).searchParams;
  for (const role of SCOPED_ROLES) {
    if (params.has(SCOPE_PARAM[role])) return { userId: await resolveScopeId(user, req, role), role };
  }
  return user;
}

export const resolveSROId = (user: { userId: string; role: UserRole }, req: Request) => resolveScopeId(user, req, "sro");
export const resolveROId = (user: { userId: string; role: UserRole }, req: Request) => resolveScopeId(user, req, "ro");
export const resolveYouthLeaderId = (user: { userId: string; role: UserRole }, req: Request) =>
  resolveScopeId(user, req, "youth-leader");
export const resolveVolunteerId = (user: { userId: string; role: UserRole }, req: Request) =>
  resolveScopeId(user, req, "volunteer");
