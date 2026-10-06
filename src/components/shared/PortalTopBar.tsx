"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Bell, ChevronRight, Trophy } from "lucide-react";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { getInitials } from "@/utils/user-status";


type PortalTopBarProps = {
  /** Maps the current path to the breadcrumb label. */
  pageLabelFor: (pathname: string) => string;
  notificationsHref: string;
};

/** Top bar shared by the SRO, RO, Youth Leader and Volunteer portals: breadcrumb, leaderboard, notifications badge, avatar. */
export function PortalTopBar({ pageLabelFor, notificationsHref }: PortalTopBarProps) {
  const pathname = usePathname();
  // The leaderboard has no sidebar entry; it's opened from the trophy here, in the same portal.
  const leaderboardHref = notificationsHref.replace(/\/notifications$/, "/leaderboard");
  const onLeaderboard = pathname.startsWith(leaderboardHref);
  const { profile } = useCurrentProfile();
  const unreadCount = useUnreadNotificationCount();

  return (
    <header className="flex items-center justify-between border-b border-slate-100 bg-white py-4 pl-16 pr-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <LayoutGrid size={15} />
        <span>YLPMS</span>
        <ChevronRight size={14} />
        <span className="text-slate-600 font-medium">{onLeaderboard ? "Leaderboard" : pageLabelFor(pathname)}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* After their cohort ends, youth leaders and volunteers only have their certificates. */}
        {!profile?.cohortAccess?.closed && (
          <Link
            href={leaderboardHref}
            aria-label="Leaderboard"
            title="Leaderboard"
            aria-current={onLeaderboard ? "page" : undefined}
            className={onLeaderboard ? "text-brand" : "text-slate-500 hover:text-slate-700"}
          >
            <Trophy size={19} />
          </Link>
        )}
        <Link
          href={notificationsHref}
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
          className="relative text-slate-500 hover:text-slate-700"
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <div
          title={profile?.name}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-400 text-xs font-semibold text-white"
        >
          {profile ? getInitials(profile.name) || "?" : ""}
        </div>
      </div>
    </header>
  );
}
