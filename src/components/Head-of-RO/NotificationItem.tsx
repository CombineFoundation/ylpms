// components/NotificationItem.tsx
'use client';

import { Bell, Circle } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  time: string;
  unread: boolean;
}

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div
      className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition ${
        notification.unread ? 'bg-orange-50/50' : ''
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            notification.unread
              ? 'bg-orange-100 text-orange-600'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Bell size={18} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <p
            className={`text-sm ${
              notification.unread ? 'text-gray-800 font-medium' : 'text-gray-600'
            }`}
          >
            {notification.title}
          </p>
          {notification.unread && (
            <Circle size={8} className="flex-shrink-0 mt-1.5 text-orange-500 fill-orange-500" />
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
      </div>
    </div>
  );
}