"use client";

import { Menu, Bell, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useSidebar } from "@/hooks/useSidebar";
import { getInitials } from "@/utils/user-status";

export default function Topbar() {
  const unreadCount = useUnreadNotificationCount();
  const { profile } = useCurrentProfile();
  const { isOpen, toggle } = useSidebar();
  const onLeaderboard = usePathname().startsWith("/Head-of-RO/leaderboard");

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
      <button
        type="button"
        onClick={toggle}
        aria-label="Open menu"
        aria-controls="app-sidebar"
        aria-expanded={isOpen}
        className="text-gray-500 hover:text-gray-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* The leaderboard has no sidebar entry; it's opened from here. */}
        <Link
          href="/Head-of-RO/leaderboard"
          aria-label="Leaderboard"
          title="Leaderboard"
          aria-current={onLeaderboard ? "page" : undefined}
          className={onLeaderboard ? "text-brand" : "text-gray-500 hover:text-gray-700"}
        >
          <Trophy className="h-5 w-5" />
        </Link>
        <Link
          href="/Head-of-RO/notifications"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          className="relative text-gray-500 hover:text-gray-700"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-0.5 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link
          href="/Head-of-RO/settings"
          title={profile?.name || "Your profile"}
          aria-label="Your profile settings"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
        >
          {getInitials(profile?.name || "") || "HR"}
        </Link>
      </div>
    </header>
  );
}
