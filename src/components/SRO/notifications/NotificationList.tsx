"use client";

import { NotificationList as SharedNotificationList } from "@/components/Head-of-RO/notifications/NotificationList";

/** The signed-in SRO's notifications (same list as Head RO, links scoped to the SRO portal). */
export function NotificationList() {
  return <SharedNotificationList portalPrefix="/SRO/" />;
}
