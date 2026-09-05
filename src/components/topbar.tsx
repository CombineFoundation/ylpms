"use client";

import { Menu, Search, Bell } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
      <button
        type="button"
        aria-label="Toggle menu"
        className="text-gray-500 hover:text-gray-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
        />
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/Head-of-RO/notifications" className="text-gray-500 hover:text-gray-700">
          <button
            type="button"
            aria-label="Notifications"
            className="relative text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8622C] text-[10px] font-bold text-white">
              2
            </span>
          </button>
        </Link>
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#E8622C] text-xs font-bold text-white">
          HR
        </div>
      </div>
    </header>
  );
}