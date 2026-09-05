"use client";

import React from "react";
import Sidebar from "@/components/SRO/Sidebar";
import { TopBar } from "@/components/SRO/TopBar";
import { DashboardContent } from "@/components/SRO/dashboard/DashboardContent";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <DashboardContent />
      </div>
    </div>
  );
}