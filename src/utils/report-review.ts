import type { UserRole } from "@/types/user.types";

/**
 * Who reviews a report: the submitter's direct manager — a youth leader's RO,
 * an RO's SRO, an SRO's Head RO. Head RO also covers anyone without a manager,
 * and a developer can review anything. The reviewer approves it or asks for
 * changes. Shared by the API (the real check) and the screens (which buttons show).
 */
export function canReviewReport(
  viewer: { userId: string; role: UserRole },
  submitter: { id: string; role?: UserRole; managerId?: string | null }
): boolean {
  if (viewer.userId === submitter.id) return false;
  if (viewer.role === "developer") return true;
  if (submitter.managerId) {
    if (viewer.userId === submitter.managerId) return true;
    return viewer.role === "head-ro" && submitter.role === "sro";
  }
  return viewer.role === "head-ro";
}

/** Who to name as the reviewer, from the submitter's side. */
export const REVIEWER_TITLE: Partial<Record<UserRole, string>> = {
  "youth-leader": "RO",
  ro: "SRO",
  sro: "Head RO",
};
