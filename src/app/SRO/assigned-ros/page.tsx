"use client";

import React from "react";
import Sidebar from "@/components/SRO/Sidebar";
import { TopBar } from "@/components/SRO/TopBar";
import { AssignedROList } from "@/components/SRO/assigned-ros/AssignedROList";

export default function AssignedROPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 flex flex-col p-6 lg:p-8">
          <AssignedROList />
        </main>
      </div>
    </div>
  );
}