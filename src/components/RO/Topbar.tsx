"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Mail,
  ChevronRight,
  Menu,
  X,
  User,
  Settings,
  LogOut,
} from "lucide-react";

type Notification = {
  id: number;
  title: string;
  time: string;
  unread: boolean;
};

const notifications: Notification[] = [
  {
    id: 1,
    title: "Sitti Amina submitted a new report for approval",
    time: "10 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Task 'Conduct Youth Leader orientation' was completed",
    time: "2 hours ago",
    unread: false,
  },
  {
    id: 3,
    title: "Disaster Drill logistics are due in 24 hours",
    time: "1 day ago",
    unread: false,
  },
];

export function Topbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const currentPage =
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .toUpperCase() || "DASHBOARD";

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>RO</span>
          <ChevronRight size={14} />
          <span className="text-slate-600 font-medium">{currentPage}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 w-64 border border-slate-100 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-full"
          />
        </div>

        {/* Mail */}
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Mail size={20} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Notifications</span>
                  <button className="text-xs text-orange-500 hover:text-orange-600 transition-colors">
                    Mark all as read
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-slate-50 transition-colors ${
                      notification.unread ? "bg-orange-50/50" : ""
                    }`}
                  >
                    <p className={`text-sm ${notification.unread ? "font-medium text-slate-800" : "text-slate-600"}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100">
                <button className="w-full text-center text-sm text-orange-500 hover:text-orange-600 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-full hover:bg-slate-50 transition-colors p-1"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
              JD
            </div>
            <span className="hidden md:inline text-sm font-medium text-slate-700">
              Juan
            </span>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Juan Dela Cruz</p>
                <p className="text-xs text-slate-500">Region IV-A Officer</p>
              </div>
              <div className="py-1">
                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <User size={16} />
                  View Profile
                </button>
                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <Settings size={16} />
                  Settings
                </button>
                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1 pt-2">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 lg:hidden">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">
              <span className="font-semibold text-slate-800">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {/* Mobile nav items would go here */}
              <p className="text-sm text-slate-500">Mobile navigation coming soon</p>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}