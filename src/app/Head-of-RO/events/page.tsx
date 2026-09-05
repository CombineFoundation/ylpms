"use client";

import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { EventList } from "@/components/Head-of-RO/events/EventList";

export default function EventsPage() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <EventList />
        </main>
      </div>
    </div>
  );
}