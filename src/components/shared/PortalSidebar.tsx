"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutUser } from "@/utils/session";
import { roleTitles, useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { getInitials } from "@/utils/user-status";
import { Users, Menu, X, LogOut, type LucideIcon } from "lucide-react";

export type PortalNavItem = { label: string; href: string; icon: LucideIcon };

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type PortalSidebarProps = {
  navItems: readonly PortalNavItem[];
  /** e.g. "SRO Portal". */
  portalName: string;
  /** The portal's notifications route, which gets the unread badge. */
  notificationsHref: string;
};

/** Sidebar shared by the SRO, RO, Youth Leader and Volunteer portals: nav, unread badge, signed-in user, sign-out. */
export function PortalSidebar({ navItems, portalName, notificationsHref }: PortalSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useCurrentProfile();
  // Shared store, so marking notifications read updates this badge immediately.
  const unreadCount = useUnreadNotificationCount();

  const badgeFor = (href: string) => (href === notificationsHref && unreadCount > 0 ? unreadCount : null);
  // Once a youth leader's or volunteer's cohort has ended, only their certificates stay open.
  const visibleItems = profile?.cohortAccess?.closed
    ? navItems.filter((item) => item.href.endsWith("/certificates"))
    : navItems;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-64 shrink-0 flex-col bg-brand
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:flex
          h-screen overflow-y-auto
        `}
      >
        {/* Close button - mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">YLPMS</p>
            <p className="text-[11px] text-white/70 leading-tight">{portalName}</p>
          </div>
        </div>

        <p className="px-6 pt-2 pb-2 text-[10px] font-semibold tracking-wider text-white/60">
          MAIN MENU
        </p>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {visibleItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const badge = badgeFor(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {active && <ChevronRightIcon />}
                {badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1 text-[11px] font-semibold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/15 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            {profile ? getInitials(profile.name) || "?" : ""}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.name ?? "Loading..."}</p>
            <p className="text-[11px] text-white/70 truncate">{profile ? roleTitles[profile.role] : ""}</p>
          </div>
          <button
            type="button"
            aria-label="Log out"
            onClick={() => signOutUser()}
            className="text-white/70 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}