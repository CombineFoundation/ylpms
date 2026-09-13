"use client";

import { useEffect, useState } from "react";
import { NotificationItem } from "@/components/Head-of-RO/NotificationItem";
import {
  HEAD_RO_NOTIFICATIONS_STORAGE_KEY,
  HEAD_RO_NOTIFICATIONS_UPDATED_EVENT,
  initialHeadRoNotifications,
} from "@/lib/head-ro-notifications";

export function NotificationList() {
  const [notifications, setNotifications] = useState(initialHeadRoNotifications);

  useEffect(() => {
    const storedNotifications = window.localStorage.getItem(
      HEAD_RO_NOTIFICATIONS_STORAGE_KEY
    );
    if (!storedNotifications) return;

    try {
      setNotifications(JSON.parse(storedNotifications));
    } catch {
      window.localStorage.removeItem(HEAD_RO_NOTIFICATIONS_STORAGE_KEY);
    }
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      unread: false,
    }));
    setNotifications(updatedNotifications);
    window.localStorage.setItem(
      HEAD_RO_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(updatedNotifications)
    );
    window.dispatchEvent(new Event(HEAD_RO_NOTIFICATIONS_UPDATED_EVENT));
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