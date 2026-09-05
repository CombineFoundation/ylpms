"use client";

import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { SroList } from "@/components/Head-of-RO/sro/SroList";

export default function SroPage() {
  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <SroList />
        </main>
      </div>
    </div>
  );
}