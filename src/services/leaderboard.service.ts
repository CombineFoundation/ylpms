import "server-only";

import { selectFields, selectFieldsWithIds } from "@/utils/firestore";
import { toDate } from "@/utils/aggregation";
import { logger } from "@/utils/errors";
import { FIRST_SYSTEM_COHORT } from "@/config/cohorts";
import { getCurrentCohort } from "./cohort.service";
import { getPerformanceTree } from "./performance.service";
import type { LeaderboardEntry, LeaderboardResponse, LeaderboardTier } from "@/types/leaderboard.types";
import type { UserRole, UserStatus } from "@/types/user.types";

/**
 * Leaderboard - the current cohort's active youth leaders and volunteers who
 * have been assigned at least one task, ranked by their performance score
 * (performance.service.ts). Every role can see it; the formula stays private.
 *
 * Ranks are unique (1, 2, 3, …) and go by performance only, never by name.
 * Equal scores are split by: more completed tasks, then whoever finished their
 * latest task first (reached that standing earlier), then whoever joined
 * first. So a rank only changes hands when someone's performance changes.
 * Tiers go by rank among the people listed: the top 5% are Diamond, the next
 * 15% Platinum, the next 30% Gold, the next 30% Silver, and the rest Bronze;
 * whoever ranks first is always Diamond.
 */

const RANKED_ROLES: UserRole[] = ["youth-leader", "volunteer"];
const HIDDEN_STATUSES: UserStatus[] = ["inactive", "suspended"];

/** Upper bound (exclusive) of each tier as a share of the ranked list. */
const TIER_CUTOFFS: [LeaderboardTier, number][] = [
  ["diamond", 0.05],
  ["platinum", 0.2],
  ["gold", 0.5],
  ["silver", 0.8],
  ["bronze", 1],
];

const tierFor = (rank: number, total: number): LeaderboardTier =>
  TIER_CUTOFFS.find(([, cutoff]) => (rank - 1) / total < cutoff)?.[0] ?? "bronze";

type MemberRow = { role?: UserRole; status?: UserStatus; cohortId?: string; createdAt?: unknown };
type CompletedTaskRow = { assignedTo?: string; completedDate?: unknown };

/** Missing dates sort last. */
const timeOf = (value: unknown) => toDate(value)?.getTime() ?? Number.MAX_SAFE_INTEGER;

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  try {
    const [tree, cohort, members, completedTasks] = await Promise.all([
      getPerformanceTree(),
      getCurrentCohort(),
      selectFieldsWithIds<MemberRow>("users", [{ field: "role", operator: "in", value: RANKED_ROLES }], [
        "role",
        "status",
        "cohortId",
        "createdAt",
      ]),
      selectFields<CompletedTaskRow>("tasks", [{ field: "status", operator: "==", value: "completed" }], [
        "assignedTo",
        "completedDate",
      ]),
    ]);

    const lastCompletedAt = new Map<string, number>();
    completedTasks.forEach((task) => {
      const at = toDate(task.completedDate)?.getTime();
      if (!task.assignedTo || at === undefined) return;
      lastCompletedAt.set(task.assignedTo, Math.max(lastCompletedAt.get(task.assignedTo) ?? 0, at));
    });
    const joinedAt = new Map(members.map((member) => [member.id, timeOf(member.createdAt)]));

    const rank = (role: UserRole): LeaderboardEntry[] => {
      const scored = members
        .filter(
          (member) =>
            member.role === role &&
            !HIDDEN_STATUSES.includes(member.status as UserStatus) &&
            (member.cohortId || FIRST_SYSTEM_COHORT.id) === cohort.id
        )
        .map((member) => tree.nodes[member.id])
        .filter((node) => node && node.ownTasks.assigned > 0 && node.performance !== null)
        .sort(
          (a, b) =>
            b.performance! - a.performance! ||
            b.ownTasks.completed - a.ownTasks.completed ||
            (lastCompletedAt.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (lastCompletedAt.get(b.id) ?? Number.MAX_SAFE_INTEGER) ||
            joinedAt.get(a.id)! - joinedAt.get(b.id)! ||
            // Last resort so the order never flips between loads; practically never reached.
            (a.id < b.id ? -1 : 1)
        );

      return scored.map((node, index) => ({
        userId: node.id,
        name: node.name,
        city: node.region,
        rank: index + 1,
        score: node.performance!,
        tier: tierFor(index + 1, scored.length),
      }));
    };

    return { cohortName: cohort.name, youthLeaders: rank("youth-leader"), volunteers: rank("volunteer") };
  } catch (error) {
    logger.error("Error building leaderboard", error);
    throw error;
  }
}
