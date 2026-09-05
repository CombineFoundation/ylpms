"use client";

import { useState } from "react";
import { NotificationItem } from "@/components/Head-of-RO/NotificationItem";

const initialNotifications = [
  {
    id: 1,
    title: "Pedro Manalo submitted a new report for approval.",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    title: "Task 'Update volunteer database' was marked as done.",
    time: "5h ago",
    unread: true,
  },
  {
    id: 3,
    title: "New RO Liza Ramos registered and awaiting assignment.",
    time: "1d ago",
    unread: false,
  },
  {
    id: 4,
    title: "National Volunteer Summit is in 21 days.",
    time: "1d ago",
    unread: false,
  },
  {
    id: 5,
    title: "Ana Cruz's analytics report needs your review.",
    time: "2d ago",
    unread: false,
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <p className="text-sm text-gray-500">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium bg-orange-50 px-4 py-2 rounded-lg transition"
          >
            Mark all as read
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg transition">
            Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      </div>
    </div>
  );
}