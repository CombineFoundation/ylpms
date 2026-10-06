"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Award, CalendarDays, CheckCircle2, ChevronRight, ListChecks, MapPin, TrendingUp } from "lucide-react";
import { usePortalData } from "@/hooks/usePortalScope";
import { roleTitles, useCurrentProfile } from "@/hooks/useCurrentProfile";
import { RecentNotifications } from "@/components/SRO/dashboard/RecentNotifications";
import { DashboardSkeleton } from "@/components/shared/dashboard/DashboardSkeleton";
import { priorityLabels, priorityStyles, statusLabels, statusStyles } from "@/components/Head-of-RO/tasks/task-display.types";
import type { VolunteerDashboardSummary } from "./dashboard.types";

function Panel({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <Link href={href} className="flex items-center gap-0.5 text-xs font-medium text-brand">
          {linkLabel} <ChevronRight size={13} />
        </Link>
      </div>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function StatCards({ stats }: { stats: VolunteerDashboardSummary["stats"] }) {
  const cards = [
    {
      label: "OPEN TASKS",
      value: stats.openTasks,
      sub: stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : "None overdue",
      icon: ListChecks,
      accent: "bg-blue-100 text-blue-500",
    },
    {
      label: "COMPLETION RATE",
      value: stats.completionRate === null ? "—" : `${stats.completionRate}%`,
      sub: `${stats.completedTasks} task${stats.completedTasks === 1 ? "" : "s"} completed`,
      icon: TrendingUp,
      accent: "bg-emerald-100 text-emerald-500",
    },
    {
      label: "UPCOMING ACTIVITIES",
      value: stats.upcomingActivities,
      sub: `${stats.activitiesAttended} attended so far`,
      icon: CalendarDays,
      accent: "bg-orange-100 text-brand",
    },
    { label: "CERTIFICATES", value: stats.certificates, sub: "Earned so far", icon: Award, accent: "bg-amber-100 text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
            <card.icon size={17} />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-wide text-slate-400">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{card.value}</p>
          <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

/** The volunteer's own dashboard: tasks, activities they signed up for, and certificates. */
export function DashboardContent() {
  const { profile } = useCurrentProfile();
  const { data: summary, isLoading, error, reload } = usePortalData<VolunteerDashboardSummary>(
    "volunteer",
    "/api/dashboard/volunteer",
    "Unable to load dashboard."
  );
  const firstName = profile?.name?.split(" ")[0];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
          <p className="mt-1 text-sm text-slate-400">Your tasks, activities and certificates in one place.</p>
        </div>
        {summary?.manager && (
          <p className="text-xs text-slate-400">
            Your {roleTitles[summary.manager.role]}: <span className="font-medium text-slate-600">{summary.manager.name}</span>
          </p>
        )}
      </div>

      {isLoading && !summary && <DashboardSkeleton />}

      {!isLoading && error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-red-500">
          {error}
          <button type="button" onClick={reload} className="font-medium text-brand hover:underline">
            Retry
          </button>
        </div>
      )}

      {summary && !error && (
        <div className={`flex flex-col gap-5 transition-opacity ${isLoading ? "opacity-60" : ""}`}>
          <StatCards stats={summary.stats} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="My Tasks" href="/volunteer/tasks" linkLabel="View all">
              {summary.upcomingTasks.length === 0 && <p className="text-xs text-slate-400">No open tasks. Nice work!</p>}
              {summary.upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-700">{task.title}</p>
                    <p className={`text-xs ${task.status === "overdue" ? "text-red-500" : "text-slate-400"}`}>Due {task.dueDate}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                </div>
              ))}
            </Panel>

            <Panel title="My Upcoming Activities" href="/volunteer/activities" linkLabel="Browse">
              {summary.upcomingActivities.length === 0 && (
                <p className="text-xs text-slate-400">You haven&apos;t signed up for anything yet. Browse upcoming activities to join one.</p>
              )}
              {summary.upcomingActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-brand">
                    <CalendarDays size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-700">{activity.title}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      {activity.date} · <MapPin size={11} /> {activity.location}
                      {activity.status === "ongoing" && <span className="font-medium text-blue-600"> · happening now</span>}
                    </p>
                  </div>
                </div>
              ))}
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_2fr]">
            <Panel title="Recent Certificates" href="/volunteer/certificates" linkLabel="All certificates">
              {summary.recentCertificates.length === 0 && (
                <p className="text-xs text-slate-400">Certificates appear here once an activity you took part in is verified.</p>
              )}
              {summary.recentCertificates.map((certificate) => (
                <div key={certificate.id} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-700">{certificate.eventTitle}</p>
                    <p className="text-xs text-slate-400">
                      {certificate.title} · {certificate.issuedAt}
                    </p>
                  </div>
                </div>
              ))}
            </Panel>
            <RecentNotifications
              notifications={summary.notifications}
              unreadCount={summary.unreadNotificationCount}
              basePath="/volunteer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
