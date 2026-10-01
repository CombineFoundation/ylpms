"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutUser } from "@/utils/session";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { useCurrentProfile, roleTitles } from "@/hooks/useCurrentProfile";
import { useSidebar } from "@/hooks/useSidebar";
import { getInitials } from "@/utils/user-status";
import {
  LayoutGrid,
  UserCheck,
  Users,
  Heart,
  Link2,
  ClipboardList,
  Calendar,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  X,
  ChevronRight,
  GraduationCap,
  Award,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/Head-of-RO/dashboard", icon: LayoutGrid },
  { label: "Senior Reporting Officers", href: "/Head-of-RO/sro", icon: UserCheck },
  { label: "Reporting Officers", href: "/Head-of-RO/ro", icon: Users },
  { label: "Youth Leaders", href: "/Head-of-RO/youth-leaders", icon: Heart },
  { label: "Volunteers", href: "/Head-of-RO/volunteers", icon: Link2 },
  { label: "Tasks", href: "/Head-of-RO/tasks", icon: ClipboardList },
  { label: "Activities", href: "/Head-of-RO/activities", icon: Calendar },
  { label: "Certificates", href: "/Head-of-RO/certificates", icon: Award },
  { label: "Reports", href: "/Head-of-RO/reports", icon: FileText },
  { label: "Training", href: "/Head-of-RO/training", icon: GraduationCap },
  { label: "Analytics", href: "/Head-of-RO/analytics", icon: BarChart3 },
  { label: "Notifications", href: "/Head-of-RO/notifications", icon: Bell },
  { label: "Settings", href: "/Head-of-RO/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();
  const unreadCount = useUnreadNotificationCount();
  const { profile } = useCurrentProfile();

  // Close the mobile drawer on navigation and on Escape.
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const displayName = profile?.name || "Head RO";

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={close} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`
          fixed lg:sticky top-0 left-0 z-50
          flex w-64 shrink-0 flex-col bg-brand
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          h-screen overflow-y-auto
        `}
      >
        {/* Close button - mobile only */}
        <button
          type="button"
          onClick={close}
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
            <p className="text-sm font-bold text-white leading-tight">Head RO Portal</p>
            <p className="text-[11px] text-white/70 leading-tight">Management System</p>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            // Nested routes (e.g. /Head-of-RO/reports/123) keep their section highlighted.
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const showBadge = item.href === "/Head-of-RO/notifications" && unreadCount > 0;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {showBadge ? (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1 text-[11px] font-semibold text-white"
                    aria-label={`${unreadCount} unread`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : (
                  active && <ChevronRight className="h-4 w-4" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/15 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            {getInitials(displayName) || "HR"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-white/70 truncate">
              {profile ? roleTitles[profile.role] : "Administrator"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            onClick={() => signOutUser(router)}
            className="text-white/70 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
