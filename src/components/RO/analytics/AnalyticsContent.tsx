"use client";

import { useMemo } from "react";
import { CheckCircle, HandHelping, Heart, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usePortalData } from "@/hooks/usePortalScope";
import { PageHeader } from "@/components/Head-of-RO/shared/ListParts";
import { MonthlyPerformance } from "@/components/SRO/dashboard/MonthlyPerformance";
import { RoPerformance } from "@/components/SRO/dashboard/RoPerformance";
import type { TeamVolunteer } from "@/components/RO/volunteers/VolunteerTable";
import type { RODashboardSummary } from "@/components/RO/dashboard/dashboard.types";

const TASK_SLICES = [
  { key: "completed", label: "Completed", color: "#10b981" },
  { key: "inProgress", label: "In progress", color: "#6366f1" },
  { key: "pending", label: "Pending", color: "#f97316" },
  { key: "overdue", label: "Overdue", color: "#ef4444" },
] as const;

const tooltipStyle = { borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 };

/** RO analytics: the same live team data as the dashboard, broken down for trends. */
export function AnalyticsContent() {
  const summary = usePortalData<RODashboardSummary>("ro", "/api/dashboard/ro", "Unable to load analytics.");
  const volunteers = usePortalData<TeamVolunteer[]>("ro", "/api/ro/volunteers", "Unable to load volunteers.");

  const data = summary.data;
  const overview = data?.taskOverview;
  const totalTasks = overview ? overview.completed + overview.inProgress + overview.pending + overview.overdue : 0;
  const completionRate = overview && totalTasks > 0 ? Math.round((overview.completed / totalTasks) * 100) : null;
  const rated = (data?.leadPerformance ?? []).filter((lead) => lead.performance !== null);
  const averagePerformance = rated.length
    ? Math.round(rated.reduce((sum, lead) => sum + (lead.performance ?? 0), 0) / rated.length)
    : null;

  const volunteersPerLeader = useMemo(() => {
    const counts = new Map<string, number>();
    (volunteers.data ?? []).forEach((v) => counts.set(v.managerName, (counts.get(v.managerName) ?? 0) + 1));
    return [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [volunteers.data]);

  // Pie reads each slice's colour from its `fill` field.
  const taskSlices = overview
    ? TASK_SLICES.map((slice) => ({ ...slice, fill: slice.color, value: overview[slice.key] })).filter((s) => s.value > 0)
    : [];

  const cards = data
    ? [
        { label: "Youth Leaders", value: data.stats.leads, sub: "Reporting to you", icon: Heart, color: "bg-orange-100 text-orange-500" },
        { label: "Volunteers", value: data.stats.volunteers, sub: "Across your team", icon: HandHelping, color: "bg-blue-100 text-blue-500" },
        {
          label: "Task completion",
          value: completionRate === null ? "—" : `${completionRate}%`,
          sub: `${overview?.completed ?? 0} of ${totalTasks} team tasks`,
          icon: CheckCircle,
          color: "bg-emerald-100 text-emerald-500",
        },
        {
          label: "Avg. youth leader score",
          value: averagePerformance === null ? "—" : `${averagePerformance}%`,
          sub: "Across your youth leaders",
          icon: TrendingUp,
          color: "bg-purple-100 text-purple-500",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="How your youth leaders and volunteers are performing." />

      {summary.isLoading && !data && (
        <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading analytics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      )}
      {!summary.isLoading && summary.error && (
        <p role="alert" className="text-sm text-red-500">
          {summary.error}{" "}
          <button type="button" onClick={summary.reload} className="font-medium text-orange-500 hover:underline">
            Retry
          </button>
        </p>
      )}

      {data && !summary.error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.color}`}>
                    <card.icon size={16} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-800">{card.value}</p>
                <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <MonthlyPerformance data={data.monthlyActivity} />
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700">Team task status</h2>
              {taskSlices.length === 0 ? (
                <p className="mt-4 text-xs text-slate-400">No team tasks yet.</p>
              ) : (
                <>
                  <div className="mt-2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={taskSlices} dataKey="value" nameKey="label" innerRadius={45} outerRadius={75} paddingAngle={2} />
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 grid grid-cols-2 gap-1 text-xs text-slate-500">
                    {taskSlices.map((slice) => (
                      <li key={slice.key} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                        {slice.label}: {slice.value}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700">Volunteers per youth leader</h2>
              {volunteers.isLoading && <p className="mt-4 text-xs text-slate-400">Loading...</p>}
              {!volunteers.isLoading && volunteers.error && (
                <p role="alert" className="mt-4 text-xs text-red-500">
                  {volunteers.error}
                </p>
              )}
              {!volunteers.isLoading && !volunteers.error && volunteersPerLeader.length === 0 && (
                <p className="mt-4 text-xs text-slate-400">No volunteers in your team yet.</p>
              )}
              {volunteersPerLeader.length > 0 && (
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volunteersPerLeader} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#fff7ed" }} />
                      <Bar dataKey="value" name="Volunteers" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <RoPerformance ros={data.leadPerformance} title="Youth Leader Performance" emptyText="No youth leaders reporting to you yet." />
          </div>
        </>
      )}
    </div>
  );
}
