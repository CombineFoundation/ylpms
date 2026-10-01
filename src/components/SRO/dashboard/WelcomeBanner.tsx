"use client";

import Link from "next/link";
import { Plus, FileText, CalendarDays } from "lucide-react";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

export function WelcomeBanner() {
  const { profile } = useCurrentProfile();
  const firstName = profile?.name?.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Welcome back{firstName ? `, ${firstName}` : ""}! 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your ROs, review reports, assign tasks, and track performance.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-400 hidden sm:block">{today}</span>
        <Link
          href="/SRO/tasks?new=1"
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} />
          Assign Task
        </Link>
        <Link
          href="/SRO/reports"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <FileText size={15} />
          Review Reports
        </Link>
        <Link
          href="/SRO/activities"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <CalendarDays size={15} />
          Activities
        </Link>
      </div>
    </div>
  );
}
