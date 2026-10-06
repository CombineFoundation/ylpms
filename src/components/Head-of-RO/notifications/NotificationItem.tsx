"use client";

import Link from "next/link";
import { Award, Bell, Circle, FileText, CheckCircle2, UserPlus, Calendar, Trash2 } from "lucide-react";
import type { NotificationType } from "@/types/notification.types";
import { DEEP_LINK_PARAM } from "@/hooks/useDeepLinkId";
import { formatRelativeTime } from "@/utils/user-status";
import type { TimestampInput } from "@/utils/user-status";

export type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  /** What it's about, so the link can open that item, not just its list. */
  relatedId?: string;
  relatedType?: string;
  createdAt: TimestampInput;
};

const iconByType: Record<NotificationType, typeof Bell> = {
  "task-assigned": CheckCircle2,
  "task-completed": CheckCircle2,
  "task-reviewed": CheckCircle2,
  "report-submitted": FileText,
  "user-added": UserPlus,
  "event-created": Calendar,
  "event-updated": Calendar,
  "certificate-issued": Award,
  "course-enrolled": FileText,
  "assignment-graded": FileText,
  "system-alert": Bell,
  other: Bell,
};

/**
 * Only follow links into this portal; anything else (other role areas, external)
 * renders as plain text. Links to a task, activity or report also carry its id,
 * so the page opens that item (older notifications included).
 */
function safeActionUrl(portalPrefix: string, notification: NotificationRow) {
  const url = notification.actionUrl;
  if (!url || !url.startsWith(portalPrefix)) return undefined;
  const param = notification.relatedType && DEEP_LINK_PARAM[notification.relatedType];
  if (!param || !notification.relatedId || url.includes(`${param}=`)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${param}=${encodeURIComponent(notification.relatedId)}`;
}

type NotificationItemProps = {
  notification: NotificationRow;
  /** Route prefix of the viewer's portal, e.g. "/SRO/"; links outside it aren't followed. */
  portalPrefix?: string;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
};

export function NotificationItem({ notification, portalPrefix = "/Head-of-RO/", onMarkRead, onDelete }: NotificationItemProps) {
  const Icon = iconByType[notification.type] || Bell;
  const href = safeActionUrl(portalPrefix, notification);

  const title = (
    <span className={`text-sm ${!notification.read ? "font-medium text-gray-800" : "text-gray-600"}`}>{notification.title}</span>
  );

  return (
    <li className={`flex items-start gap-4 px-6 py-4 transition hover:bg-gray-50 ${!notification.read ? "bg-orange-50/50" : ""}`}>
      <div className="mt-0.5 shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            !notification.read ? "bg-orange-100 text-brand-dark" : "bg-gray-100 text-gray-400"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          {href ? (
            // The link wraps only the text, so the action buttons aren't nested inside an anchor.
            <Link
              href={href}
              onClick={() => !notification.read && onMarkRead(notification.id)}
              className="hover:underline"
            >
              {title}
            </Link>
          ) : (
            title
          )}
          {!notification.read && (
            <Circle size={8} className="mt-1.5 shrink-0 fill-brand text-brand" aria-label="Unread" />
          )}
        </div>
        {notification.message && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{notification.message}</p>}
        <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(notification.createdAt)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!notification.read && (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="text-xs font-medium text-brand-dark hover:text-brand-dark"
          >
            Mark read
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          aria-label="Delete notification"
          className="text-gray-300 transition-colors hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}
