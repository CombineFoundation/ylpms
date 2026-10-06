export type LeaderboardTier = "diamond" | "platinum" | "gold" | "silver" | "bronze";

export interface LeaderboardEntry {
  userId: string;
  name: string;
  /** For youth leaders and volunteers, `region` holds their city. */
  city?: string;
  /** 1 = best; equal scores share a rank. */
  rank: number;
  /** 0–100. */
  score: number;
  tier: LeaderboardTier;
}

/** GET /api/leaderboard */
export interface LeaderboardResponse {
  cohortName: string;
  youthLeaders: LeaderboardEntry[];
  volunteers: LeaderboardEntry[];
}
