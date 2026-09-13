"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import Link from "next/link";
import {
  HEAD_RO_NOTIFICATIONS_STORAGE_KEY,
  HEAD_RO_NOTIFICATIONS_UPDATED_EVENT,
  initialHeadRoNotifications,
  type HeadRoNotification,
} from "@/lib/head-ro-notifications";

function getUnreadCount(notifications: HeadRoNotification[]) {
  return notifications.filter((notification) => notification.unread).length;
}

export default function Topbar() {
  const [unreadCount, setUnreadCount] = useState(() =>
    getUnreadCount(initialHeadRoNotifications)
  );

  useEffect(() => {
    const updateUnreadCount = () => {
      const storedNotifications = window.localStorage.getItem(
        HEAD_RO_NOTIFICATIONS_STORAGE_KEY
      );

      if (!storedNotifications) return;

      try {
        setUnreadCount(getUnreadCount(JSON.parse(storedNotifications)));
      } catch {
        window.localStorage.removeItem(HEAD_RO_NOTIFICATIONS_STORAGE_KEY);
      }
    };

    updateUnreadCount();
    window.addEventListener("storage", updateUnreadCount);
    window.addEventListener(HEAD_RO_NOTIFICATIONS_UPDATED_EVENT, updateUnreadCount);

    return () => {
      window.removeEventListener("storage", updateUnreadCount);
      window.removeEventListener(HEAD_RO_NOTIFICATIONS_UPDATED_EVENT, updateUnreadCount);
    };
  }, []);

  return (
    <header className="flex items-center justify-end gap-4 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
      <button
        type="button"
        aria-label="Toggle menu"
        className="text-gray-500 hover:text-gray-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/Head-of-RO/notifications" className="text-gray-500 hover:text-gray-700">
          <button
            type="button"
            aria-label={`${unreadCount} unread notifications`}
            className="relative text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E8622C] px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </Link>
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#E8622C] text-xs font-bold text-white">
          HR
        </div>
      </div>
    </header>
  );
}