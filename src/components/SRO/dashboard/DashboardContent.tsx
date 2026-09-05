"use client";

import { WelcomeBanner } from "./WelcomeBanner";
import { StatCards } from "./StatCards";
import { MonthlyPerformance } from "./MonthlyPerformance";
import { RoPerformance } from "./RoPerformance";
import { TaskOverview } from "./TaskOverview";
import { RecentReports } from "./RecentReports";
import { RecentNotifications } from "./RecentNotifications";

export function DashboardContent() {
  return (
    <div className="flex-1 flex flex-col gap-5 p-6 lg:p-8">
      <WelcomeBanner />
      <StatCards />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <MonthlyPerformance />
        <RoPerformance />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TaskOverview />
        <RecentReports />
      </div>

      <RecentNotifications />
    </div>
  );
}