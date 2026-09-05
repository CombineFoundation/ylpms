"use client";

import React from "react";
import Sidebar from "@/components/RO/Sidebar";
import { Topbar } from "@/components/RO/Topbar";
import { SettingsContent } from "@/components/RO/settings/SettingsContent";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <SettingsContent />
        </main>
      </div>
    </div>
  );
}