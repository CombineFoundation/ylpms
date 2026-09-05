"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ListChecks,
  FileText,
  Menu,
  X,
  Book,
  MessageSquare as Notification,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/SRO/dashboard", icon: LayoutGrid },
  { label: "Assigned ROs", href: "/SRO/assigned-ros", icon: Users },
  { label: "Tasks", href: "/SRO/tasks", icon: ListChecks },
  { label: "Reports", href: "/SRO/reports", icon: FileText, badge: 2 },
  { label: "Notifications", href: "/SRO/notifications", icon: Notification, badge: 2 },
];

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#E8622C] text-white hover:bg-[#d45520] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-64 shrink-0 flex-col bg-[#E8622C]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:flex
          h-screen overflow-y-auto
        `}
      >
        {/* Close button - mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">YLPMS</p>
            <p className="text-[11px] text-white/70 leading-tight">SRO Portal</p>
          </div>
        </div>

        <p className="px-6 pt-2 pb-2 text-[10px] font-semibold tracking-wider text-white/60">
          MAIN MENU
        </p>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {active && <ChevronRightIcon />}
                {item.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[11px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/15 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            SJ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Sarah Johnson</p>
            <p className="text-[11px] text-white/70 truncate">Senior RO</p>
          </div>
        </div>
      </aside>
    </>
  );
}