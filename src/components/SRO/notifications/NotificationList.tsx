"use client";

import { useState } from "react";
import { Bell, ChevronRight, User, Calendar, CheckCircle, AlertCircle } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  category: "From Head RO" | "Activity Updates";
};

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Head RO assigned you a new task: 'Compile NCR region Q2 summary report'.",
    time: "30m ago",
    unread: true,
    category: "From Head RO",
  },
  {
    id: "2",
    title: "Head RO assigned you a task: 'Attend national SRO coordination meeting' due Aug 18.",
    time: "2h ago",
    unread: true,
    category: "From Head RO",
  },
  {
    id: "3",
    title: "Head RO marked your mid-year evaluation submission as received.",
    time: "1d ago",
    unread: true,
    category: "From Head RO",
  },
  {
    id: "4",
    title: "Pedro Manalo submitted a new report for your review.",
    time: "1h ago",
    unread: true,
    category: "Activity Updates",
  },
  {
    id: "5",
    title: "Task 'Coordinate event logistics' assigned to Ramon Aquino is overdue.",
    time: "3h ago",
    unread: false,
    category: "Activity Updates",
  },
  {
    id: "6",
    title: "Gloria Mendoza completed the Q2 performance report.",
    time: "6h ago",
    unread: false,
    category: "Activity Updates",
  },
  {
    id: "7",
    title: "New youth leader registered under Rosa Bautista.",
    time: "1d ago",
    unread: false,
    category: "Activity Updates",
  },
];

export function NotificationList() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  const markCategoryAsRead = (category: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.category === category ? { ...n, unread: false } : n
      )
    );
  };

  const headRONotifications = notifications.filter(
    (n) => n.category === "From Head RO"
  );
  const activityNotifications = notifications.filter(
    (n) => n.category === "Activity Updates"
  );

  const headROUnread = headRONotifications.filter((n) => n.unread).length;
  const activityUnread = activityNotifications.filter((n) => n.unread).length;

  const NotificationGroup = ({
    title,
    notifications,
    unreadCount,
    onMarkAllRead,
    icon,
  }: {
    title: string;
    notifications: Notification[];
    unreadCount: number;
    onMarkAllRead: () => void;
    icon: React.ReactNode;
  }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              notification.unread ? "bg-orange-50 border border-orange-100" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {notification.unread && (
                <span className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  notification.unread ? "text-gray-800 font-medium" : "text-gray-600"
                } ${!notification.unread ? "pl-5" : ""}`}
              >
                {notification.title}
              </span>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
              {notification.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          <Bell size={18} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">
          {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Notifications card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5">
          <NotificationGroup
            title="From Head RO"
            notifications={headRONotifications}
            unreadCount={headROUnread}
            onMarkAllRead={() => markCategoryAsRead("From Head RO")}
            icon={<User size={16} className="text-blue-500" />}
          />

          <div className="border-t border-gray-100 my-4" />

          <NotificationGroup
            title="Activity Updates"
            notifications={activityNotifications}
            unreadCount={activityUnread}
            onMarkAllRead={() => markCategoryAsRead("Activity Updates")}
            icon={<Bell size={16} className="text-orange-500" />}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Sarah Johnson</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400">Senior RO</span>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}