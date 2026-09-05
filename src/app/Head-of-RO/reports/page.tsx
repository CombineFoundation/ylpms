"use client";

import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { ReportList } from "@/components/Head-of-RO/reports/ReportList";

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <ReportList />
        </main>
      </div>
    </div>
  );
}