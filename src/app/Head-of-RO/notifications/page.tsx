import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { NotificationList } from "@/components/Head-of-RO/notifications/NotificationList";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <NotificationList />
        </main>
      </div>
    </div>
  );
}