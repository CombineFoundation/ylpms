import { Users, CalendarDays, FileText, ClipboardCheck, TrendingUp, TrendingDown } from "lucide-react";
import type { AnalyticsSummary } from "./analytics.types";

type AnalyticsStatCardsProps = {
  stats: AnalyticsSummary["stats"];
};

const CARD_META = [
  { key: "totalUsers" as const, label: "Total Users", icon: Users },
  { key: "activitiesThisMonth" as const, label: "Activities This Month", icon: CalendarDays },
  { key: "reportsFiled" as const, label: "Reports Filed", icon: FileText },
  { key: "tasksCompleted" as const, label: "Tasks Completed", icon: ClipboardCheck },
];

export function AnalyticsStatCards({ stats }: AnalyticsStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARD_META.map(({ key, label, icon: Icon }) => {
        const stat = stats[key];
        const tone = stat.change > 0 ? "text-green-600" : stat.change < 0 ? "text-red-500" : "text-gray-400";
        return (
          <div key={key} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                <Icon size={15} className="text-brand" />
              </div>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="mb-1 text-2xl font-bold text-gray-800">{stat.total}</p>
            <div className={`flex items-center gap-1 text-[11px] font-medium ${tone}`}>
              {stat.change > 0 && <TrendingUp size={11} />}
              {stat.change < 0 && <TrendingDown size={11} />}
              {stat.change === 0 ? `No change ${stat.changeLabel}` : `${stat.change > 0 ? "+" : ""}${stat.change} ${stat.changeLabel}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
