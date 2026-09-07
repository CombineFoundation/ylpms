"use client";

import React from "react";
import Sidebar from "@/components/SRO/Sidebar";
import { Topbar } from "@/components/SRO/Topbar";
import { AssignedROList } from "@/components/SRO/assigned-ros/AssignedROList";

export default function AssignedROPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 flex flex-col p-6 lg:p-8">
          <AssignedROList />
        </main>
      </div>
    </div>
  );
}