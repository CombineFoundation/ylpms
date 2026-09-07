"use client";

import React from "react";
import { TrainingList } from "@/components/Head-of-RO/training/TrainingList";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function TrainingPage() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <TrainingList />
        </main>
      </div>
    </div>
  );
}