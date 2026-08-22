"use client";

import { StatCards } from "./StatCards";
import { RecentActivity } from "./RecentActivity";
import { UpcomingActivities } from "./UpcomingActivities";

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, Zainab 🌟
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your volunteers and activities
        </p>
      </div>

      {/* Stat Cards */}
      <StatCards />

      {/* Recent Activity and Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentActivity />
        <UpcomingActivities />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Zainab Ali</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">Youth Leader</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Last updated: Today</span>
        </div>
      </div>
    </div>
  );
}