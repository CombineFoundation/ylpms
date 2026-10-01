import { UserCheck, Users, Heart, Link2, TrendingUp } from "lucide-react";
import type { DashboardSummary } from "./dashboard.types";

type DashboardStatCardsProps = {
  stats: DashboardSummary["stats"];
};

const CARD_META = [
  { key: "sro" as const, label: "Total SROs", icon: UserCheck },
  { key: "ro" as const, label: "Total ROs", icon: Users },
  { key: "youth-leader" as const, label: "Youth Leaders", icon: Heart },
  { key: "volunteer" as const, label: "Volunteers", icon: Link2 },
];

export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {CARD_META.map(({ key, label, icon: Icon }) => {
        const count = stats[key];
        return (
          <div key={key} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E8622C]/10">
                <Icon className="h-5 w-5 text-[#E8622C]" />
              </div>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{count.total}</p>
            <p
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                count.newThisMonth > 0 ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {count.newThisMonth > 0 && <TrendingUp className="h-3.5 w-3.5" />}
              {count.newThisMonth > 0 ? `+${count.newThisMonth} this month` : "No change this month"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
