import { Award, Crown, Gem, Medal, Trophy, type LucideIcon } from "lucide-react";
import type { LeaderboardTier } from "@/types/leaderboard.types";

/** Best tier first. The share is of everyone ranked (see leaderboard.service.ts). */
export const TIERS: { tier: LeaderboardTier; label: string; share: string; icon: LucideIcon; badge: string; ring: string }[] = [
  { tier: "diamond", label: "Diamond", share: "Top 5%", icon: Gem, badge: "bg-cyan-50 text-cyan-700 ring-cyan-200", ring: "ring-cyan-300" },
  { tier: "platinum", label: "Platinum", share: "Next 15%", icon: Crown, badge: "bg-indigo-50 text-indigo-700 ring-indigo-200", ring: "ring-indigo-300" },
  { tier: "gold", label: "Gold", share: "Next 30%", icon: Trophy, badge: "bg-amber-50 text-amber-700 ring-amber-200", ring: "ring-amber-300" },
  { tier: "silver", label: "Silver", share: "Next 30%", icon: Medal, badge: "bg-slate-100 text-slate-600 ring-slate-200", ring: "ring-slate-300" },
  { tier: "bronze", label: "Bronze", share: "Everyone else", icon: Award, badge: "bg-orange-50 text-orange-800 ring-orange-200", ring: "ring-orange-300" },
];

export const tierInfo = (tier: LeaderboardTier) => TIERS.find((item) => item.tier === tier) ?? TIERS[TIERS.length - 1];
