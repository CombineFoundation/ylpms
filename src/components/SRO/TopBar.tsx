"use client";

import { LayoutGrid, Search, Bell, Mail, ChevronRight } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-100 bg-white px-8 py-4">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <LayoutGrid size={15} />
        <span>YLPMS</span>
        <ChevronRight size={14} />
        <span className="text-slate-600 font-medium">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 w-64">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Search..."
            className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-full"
          />
        </div>
        <button className="relative text-slate-500 hover:text-slate-700">
          <Mail size={19} />
        </button>
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell size={19} />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-400 text-xs font-semibold text-white">
          SJ
        </div>
      </div>
    </header>
  );
}