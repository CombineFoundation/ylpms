import "server-only";

import { selectFieldsWithIds } from "@/utils/firestore";
import { logger } from "@/utils/errors";
import { FIRST_SYSTEM_COHORT } from "@/config/cohorts";
import { getCurrentCohort } from "./cohort.service";
import { getPerformanceTree } from "./performance.service";
import type { LeaderboardEntry, LeaderboardResponse, LeaderboardTier } from "@/types/leaderboard.types";
import type { UserRole, UserStatus } from "@/types/user.types";

/**
 * Leaderboard - the current cohort's active youth leaders and volunteers,
 * ranked by their performance score (performance.service.ts). People with no
 * score yet aren't ranked. Every role can see it; the formula stays private.
 *
 * Tiers go by rank, not score: the top 5% are Diamond, the next 15% Platinum,
 * the next 30% Gold, the next 30% Silver, and the rest Bronze. Equal scores
 * share a rank (1, 2, 2, 4) and so a tier; whoever ranks first is always Diamond.
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

type MemberRow = { role?: UserRole; status?: UserStatus; cohortId?: string };

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  try {
    const [tree, cohort, members] = await Promise.all([
      getPerformanceTree(),
      getCurrentCohort(),
      selectFieldsWithIds<MemberRow>("users", [{ field: "role", operator: "in", value: RANKED_ROLES }], [
        "role",
        "status",
        "cohortId",
      ]),
    ]);

    const rank = (role: UserRole): LeaderboardEntry[] => {
      const scored = members
        .filter(
          (member) =>
            member.role === role &&
            !HIDDEN_STATUSES.includes(member.status as UserStatus) &&
            (member.cohortId || FIRST_SYSTEM_COHORT.id) === cohort.id
        )
        .map((member) => tree.nodes[member.id])
        .filter((node) => node && node.performance !== null)
        .sort((a, b) => b.performance! - a.performance! || a.name.localeCompare(b.name));

      let previousScore: number | null = null;
      let previousRank = 0;
      return scored.map((node, index) => {
        const rankNumber = node.performance === previousScore ? previousRank : index + 1;
        previousScore = node.performance;
        previousRank = rankNumber;
        return {
          userId: node.id,
          name: node.name,
          city: node.region,
          rank: rankNumber,
          score: node.performance!,
          tier: tierFor(rankNumber, scored.length),
        };
      });
    };

    return { cohortName: cohort.name, youthLeaders: rank("youth-leader"), volunteers: rank("volunteer") };
  } catch (error) {
    logger.error("Error building leaderboard", error);
    throw error;
  }
}
