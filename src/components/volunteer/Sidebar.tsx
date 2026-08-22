"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  GraduationCap,
  Award,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/volunteer/dashboard", icon: LayoutDashboard },
  { label: "My Tasks", href: "/volunteer/tasks", icon: CheckSquare, badge: 2 },
  { label: "Activities", href: "/volunteer/activities", icon: Calendar },
  { label: "Training", href: "/volunteer/training", icon: GraduationCap },
  { label: "Certificates", href: "/volunteer/certificates", icon: Award, badge: 4 },
  { label: "Notifications", href: "/volunteer/notifications", icon: Bell, badge: 3 },
];

const accountItems = [
  { label: "Profile", href: "/volunteer/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#E8622C] text-white hover:bg-[#d45520] transition-colors"
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
          w-64 shrink-0 flex-col bg-[#E8622C]
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

        {/* Brand */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <span className="text-lg font-bold text-white">YLP</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                Combine Foundation
              </p>
              <p className="text-[10px] text-white/70 leading-tight tracking-wide">
                YOUTH LEADERSHIP PROGRAM
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Navigation
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
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
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Account Section */}
          <p className="mt-6 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Account
          </p>
          <div className="space-y-1">
            {accountItems.map((item) => {
              const active = isActive(item.href);
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
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-t border-white/15 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            ZA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Zainab Ali</p>
            <p className="text-[11px] text-white/70 truncate">Youth Leader</p>
          </div>
          <button
            type="button"
            aria-label="Log out"
            className="text-white/70 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}