"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/utils/user-status";
import type { SRODashboardSummary } from "./dashboard.types";

type RecentNotificationsProps = {
  notifications: SRODashboardSummary["notifications"];
  unreadCount: number;
  basePath?: string;
};

export function RecentNotifications({ notifications, unreadCount, basePath = "/SRO" }: RecentNotificationsProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Recent Notifications
          {unreadCount > 0 && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">{unreadCount} new</span>
          )}
        </h2>
        <Link href={`${basePath}/notifications`} className="text-xs font-medium text-orange-500">
          View all
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {notifications.length === 0 && <p className="text-xs text-slate-400">No notifications yet.</p>}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${
              n.read ? "bg-slate-50" : "bg-orange-50"
            }`}
          >
            <div className="flex min-w-0 items-center gap-2 text-slate-600">
              {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />}
              <span className={`truncate ${n.read ? "pl-3.5" : ""}`}>
                {n.title}
                {n.message && <span className="text-slate-400"> — {n.message}</span>}
              </span>
            </div>
            <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(n.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
