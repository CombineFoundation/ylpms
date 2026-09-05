"use client";

import React from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { ActivityLogsList } from "@/components/Head-of-RO/activities-logs/ActivityLogsList";

export default function ActivityLogsPage() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <ActivityLogsList />
        </main>
      </div>
    </div>
  );
}