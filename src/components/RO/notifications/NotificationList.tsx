"use client";

import { useState } from "react";
import { Bell, CheckCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  time: string;
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Sitti Amina submitted the Q3 Community Outreach Report for approval.",
    time: "10 mins ago",
    unread: true,
  },
  {
    id: "2",
    title: "Dave Bautista marked 'Conduct Youth Leader orientation' as complete.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "3",
    title: "System Alert: Disaster Drill logistics are due in 24 hours.",
    time: "1 day ago",
    unread: true,
  },
  {
    id: "4",
    title: "New volunteer 'Andres Bonifacio' registered under leader John Mark Reyes.",
    time: "3 days ago",
    unread: false,
  },
  {
    id: "5",
    title: "Juan Dela Cruz, Region IV-A Officer, changed regional targets.",
    time: "1 week ago",
    unread: false,
  },
];

const notificationIcons: Record<string, React.ReactNode> = {
  "Sitti Amina": <Bell size={16} className="text-orange-500" />,
  "Dave Bautista": <CheckCircle size={16} className="text-emerald-500" />,
  "System Alert": <AlertCircle size={16} className="text-red-500" />,
  "New volunteer": <Bell size={16} className="text-blue-500" />,
  "Juan Dela Cruz": <Bell size={16} className="text-purple-500" />,
};

export function NotificationList() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  const getIcon = (title: string) => {
    if (title.includes("Sitti Amina")) return notificationIcons["Sitti Amina"];
    if (title.includes("Dave Bautista")) return notificationIcons["Dave Bautista"];
    if (title.includes("System Alert")) return notificationIcons["System Alert"];
    if (title.includes("New volunteer")) return notificationIcons["New volunteer"];
    if (title.includes("Juan Dela Cruz")) return notificationIcons["Juan Dela Cruz"];
    return <Bell size={16} className="text-gray-400" />;
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
        <p className="text-sm text-gray-500">
          Stay updated with activities and system alerts in your region.
        </p>
      </div>

      {/* Notifications card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header with unread count */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-700">Recent Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                {unreadCount} Unread
              </span>
            )}
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

        {/* Notification list */}
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors ${
                notification.unread ? "bg-orange-50/50" : "hover:bg-gray-50/50"
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5 flex-shrink-0">
                  {getIcon(notification.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {notification.unread && (
                      <span className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
                    )}
                    <p className={`text-sm ${notification.unread ? "font-medium text-gray-800" : "text-gray-600"}`}>
                      {notification.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                </div>
              </div>
              {notification.unread && (
                <button className="flex-shrink-0 text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors">
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Total Notifications:</span>
            <span className="text-gray-900 font-semibold">{notifications.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Showing all notifications</span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}