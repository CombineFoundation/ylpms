"use client";

import React from "react";
import Sidebar from "@/components/RO/Sidebar";
import { Topbar } from "@/components/RO/Topbar";
import { AnalyticsContent } from "@/components/RO/analytics/AnalyticsContent";

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnalyticsContent />
        </main>
      </div>
    </div>
  );
}