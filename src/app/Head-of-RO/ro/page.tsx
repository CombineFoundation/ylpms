"use client";

import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { RoList } from "@/components/Head-of-RO/ros/RoList";

export default function RoPage() {
  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <RoList />
        </main>
      </div>
    </div>
  );
}