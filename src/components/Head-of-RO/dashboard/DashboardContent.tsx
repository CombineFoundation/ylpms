"use client";

import {
  UserCheck,
  Users,
  Heart,
  Link2,
  ClipboardList,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// Static data — swap these for real data from your API / database
// ---------------------------------------------------------------------------

const statCards = [
  {
    label: "Total SROs",
    value: "5",
    icon: UserCheck,
    delta: "+1 this month",
    trend: "up" as const,
  },
  {
    label: "Total ROs",
    value: "6",
    icon: Users,
    delta: "+2 this month",
    trend: "up" as const,
  },
  {
    label: "Youth Leaders",
    value: "4",
    icon: Heart,
    delta: "No change",
    trend: "flat" as const,
  },
  {
    label: "Volunteers",
    value: "389",
    icon: Link2,
    delta: "+39 this month",
    trend: "up" as const,
  },
];

const volunteerActivity = [
  { month: "Feb", value: 210 },
  { month: "Mar", value: 240 },
  { month: "Apr", value: 285 },
  { month: "May", value: 300 },
  { month: "Jun", value: 355 },
  { month: "Jul", value: 400 },
  { month: "Aug", value: 385 },
];

const regionData = [
  { name: "NCR", value: 30, color: "#EA580C" },
  { name: "Region VII", value: 28, color: "#FBBF7D" },
  { name: "Region IV-A", value: 20, color: "#1E3A6E" },
  { name: "Region III", value: 22, color: "#F7C9A0" },
];

const pendingReports = [
  {
    title: "Q2 Volunteer Activity Report",
    meta: "Pedro Manalo · NCR",
  },
  {
    title: "Event Post-Evaluation Form",
    meta: "Ramon Aquino · Region VII",
  },
];

const upcomingTasks = [
  {
    title: "Review Q2 volunteer reports",
    meta: "Aug 10, 2026 · All SROs",
    priority: "High" as const,
  },
  {
    title: "Onboard 3 new ROs in NCR",
    meta: "Aug 15, 2026 · Maria Santos",
    priority: "Medium" as const,
  },
  {
    title: "Conduct youth leader training",
    meta: "Aug 20, 2026 · Jose Reyes",
    priority: "High" as const,
  },
  {
    title: "Submit region analytics report",
    meta: "Aug 5, 2026 · Ana Cruz",
    priority: "High" as const,
  },
];

const priorityStyles: Record<string, string> = {
  High: "bg-red-100 text-red-500",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-emerald-100 text-emerald-600",
};

// ---------------------------------------------------------------------------

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, Head RO. Here&rsquo;s what&rsquo;s happening.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E8622C]/10">
                <card.icon className="h-5 w-5 text-[#E8622C]" />
              </div>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {card.value}
            </p>
            <p
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                card.trend === "up"
                  ? "text-emerald-600"
                  : card.trend === "flat"
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {card.trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
              {card.trend === "flat" && (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {card.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Volunteer Activity
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volunteerActivity}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#EEF0F2"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  domain={[0, 600]}
                  ticks={[0, 150, 300, 450, 600]}
                />
                <Bar
                  dataKey="value"
                  fill="#EA580C"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Volunteers by Region
          </h2>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={0}
                  outerRadius={100}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {regionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports + Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-5">
            Recent Reports for Approval
          </h2>
          <div className="divide-y divide-gray-100">
            {pendingReports.map((report) => (
              <div
                key={report.title}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {report.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {report.meta}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="rounded-full bg-[#E8622C] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#d9551f] transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-5">
            Upcoming Tasks
          </h2>
          <div className="divide-y divide-gray-100">
            {upcomingTasks.map((task) => (
              <div
                key={task.title}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8622C]/10">
                    <ClipboardList className="h-4 w-4 text-[#E8622C]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {task.meta}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${priorityStyles[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}