"use client";

import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { DashboardContent } from "@/components/Head-of-RO/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <DashboardContent />
        </main>
      </div>
    </div>
  );
}