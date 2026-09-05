"use client";

import React from "react";
import Sidebar from "@/components/Youth-Leader/Sidebar";
import Topbar from "@/components/Youth-Leader/Topbar";

export default function YouthLeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}