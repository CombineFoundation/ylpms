"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  FileText,
  Calendar,
  Users,
  Filter,
  ChevronDown,
  Check,
  X,
} from "lucide-react";

type NotificationType = "Task" | "Activity" | "Report" | "Certificate" | "Training" | "Announcement";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "Certificate",
    title: "Certificate Issued",
    description: 'Your certificate for "Community Clean-Up Drive" has been issued and is ready to download.',
    time: "2 hours ago",
    read: false,
    icon: <Award size={16} />,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "2",
    type: "Activity",
    title: "Activity Approved",
    description: '"Youth Leadership Workshop" has been approved by Head RO Ahmad Karim. The event is scheduled for Aug 22.',
    time: "4 hours ago",
    read: false,
    icon: <Calendar size={16} />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "3",
    type: "Task",
    title: "New Task Assigned",
    description: 'Ahmad Karim has assigned you the task "Prepare Q3 program report" due Aug 18, 2025.',
    time: "6 hours ago",
    read: false,
    icon: <CheckCircle size={16} />,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "4",
    type: "Report",
    title: "Report Approved",
    description: 'Your report "Community Clean-Up Drive Report" has been approved by Bilal Hussain.',
    time: "1 day ago",
    read: true,
    icon: <FileText size={16} />,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "5",
    type: "Task",
    title: "Deadline Reminder",
    description: 'Task "Review training materials" was due Aug 12. Please update the status immediately.',
    time: "2 days ago",
    read: true,
    icon: <AlertCircle size={16} />,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    id: "6",
    type: "Training",
    title: "New Training Resource",
    description: 'A new video "Leadership Skills 101" has been uploaded to the Training Portal by Ahmad Karim.',
    time: "3 days ago",
    read: true,
    icon: <Users size={16} />,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    id: "7",
    type: "Announcement",
    title: "Program Announcement",
    description: "All branches: Q3 review submissions are due by August 20. Ensure all reports are complete and submitted on time.",
    time: "4 days ago",
    read: true,
    icon: <Bell size={16} />,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

const typeFilters = ["All", "Task", "Activity", "Report", "Certificate", "Training", "Announcement"];

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<NotificationType | "All">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || notification.type === filterType;
    return matchesSearch && matchesType;
  });

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, read: true }))
    );
  };

  const getTypeBadgeColor = (type: NotificationType) => {
    const colors = {
      Task: "bg-orange-100 text-orange-600",
      Activity: "bg-blue-100 text-blue-600",
      Report: "bg-purple-100 text-purple-600",
      Certificate: "bg-emerald-100 text-emerald-600",
      Training: "bg-indigo-100 text-indigo-600",
      Announcement: "bg-amber-100 text-amber-600",
    };
    return colors[type];
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-500">
              {unreadCount === 0 ? "All caught up! 🎉" : `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-sm font-medium text-[#E8622C] hover:text-[#d45520] transition-colors"
            >
              <Check size={16} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {typeFilters.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as NotificationType | "All")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filterType === type
                ? "bg-[#E8622C] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative w-64">
          <Bell
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={15} />
            {filterType === "All" ? "All Types" : filterType}
            <ChevronDown size={14} />
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-10">
              {typeFilters.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type as NotificationType | "All");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    filterType === type ? "text-[#E8622C] font-medium" : "text-gray-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No notifications to show</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !notification.read ? "bg-orange-50/50 hover:bg-orange-50" : "hover:bg-gray-50"
                }`}
              >
                {/* Icon */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${notification.iconBg} ${notification.iconColor}`}>
                  {notification.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm font-semibold ${!notification.read ? "text-gray-800" : "text-gray-600"}`}>
                      {notification.title}
                    </h3>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${getTypeBadgeColor(notification.type)}`}
                    >
                      {notification.type}
                    </span>
                    {!notification.read && (
                      <span className="inline-block h-2 w-2 rounded-full bg-[#E8622C]" />
                    )}
                  </div>
                  <p className={`text-sm ${!notification.read ? "text-gray-700" : "text-gray-500"} mt-0.5`}>
                    {notification.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs font-medium text-[#E8622C] hover:text-[#d45520] transition-colors whitespace-nowrap"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Total Notifications:</span>
            <span className="text-gray-900 font-semibold">{filtered.length}</span>
            {unreadCount > 0 && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-xs text-[#E8622C]">{unreadCount} unread</span>
              </>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-[#E8622C] hover:text-[#d45520] transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}