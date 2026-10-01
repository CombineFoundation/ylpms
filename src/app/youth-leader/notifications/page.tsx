import type { Metadata } from "next";
import { NotificationList } from "@/components/Head-of-RO/notifications/NotificationList";

export const metadata: Metadata = { title: "Notifications" };

export default function Page() {
  return <NotificationList portalPrefix="/youth-leader/" />;
}
