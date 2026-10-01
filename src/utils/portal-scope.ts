/**
 * Portals whose data is one person's (a manager's team, or a volunteer's own
 * account). Shared by the client scope picker and the server-side resolver,
 * so this module must stay free of server-only imports.
 */
export type ScopedRole = "sro" | "ro" | "youth-leader" | "volunteer";

export const SCOPED_ROLES: ScopedRole[] = ["sro", "ro", "youth-leader", "volunteer"];

export const portalNames: Record<ScopedRole, string> = {
  sro: "SRO",
  ro: "RO",
  "youth-leader": "Youth Leader",
  volunteer: "Volunteer",
};

/** Query param a developer uses to pick whose portal they're viewing. */
export const SCOPE_PARAM: Record<ScopedRole, string> = {
  sro: "sroId",
  ro: "roId",
  "youth-leader": "youthLeaderId",
  volunteer: "volunteerId",
};
