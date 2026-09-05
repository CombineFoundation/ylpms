"use client";

import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Stat Cards Data
const statCards = [
  {
    label: "Youth Leaders",
    value: "3",
    sub: "Active",
    icon: Users,
    color: "bg-orange-100 text-orange-500",
  },
  {
    label: "Tasks Assigned",
    value: "45",
    sub: "Registered",
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-500",
  },
  {
    label: "Events This Month",
    value: "2",
    sub: "Scheduled",
    icon: Calendar,
    color: "bg-emerald-100 text-emerald-500",
  },
];

// Volunteer Hours Data
const volunteerHours = [
  { month: "Feb", hours: 120 },
  { month: "Mar", hours: 180 },
  { month: "Apr", hours: 210 },
  { month: "May", hours: 240 },
  { month: "Jun", hours: 260 },
  { month: "Jul", hours: 280 },
];

// Upcoming Tasks Data
const upcomingTasks = [
  {
    id: 1,
    title: "Update volunteer profile database",
    due: "Sep 15, 2026",
    status: "In Progress",
    statusColor: "text-blue-600",
    statusBg: "bg-blue-100",
  },
  {
    id: 2,
    title: "Prepare logistics for Disaster Drill",
    due: "Sep 12, 2026",
    status: "In Progress",
    statusColor: "text-blue-600",
    statusBg: "bg-blue-100",
  },
  {
    id: 3,
    title: "Conduct Youth Leader orientation",
    due: "Sep 20, 2026",
    status: "In Progress",
    statusColor: "text-blue-600",
    statusBg: "bg-blue-100",
  },
  {
    id: 4,
    title: "Submit monthly regional status",
    due: "Aug 31, 2026",
    status: "Done",
    statusColor: "text-emerald-600",
    statusBg: "bg-emerald-100",
  },
];

// Recent Activity Data
const recentActivities = [
  {
    id: 1,
    text: "John Mark Reyes added 5 new volunteers in Barangay Bogumbayan",
    time: "2 hours ago",
  },
  {
    id: 2,
    text: "Task 'Submit monthly regional status' was completed",
    time: "1 day ago",
  },
  {
    id: 3,
    text: "Event 'Youth Leadership Workshop' updated details",
    time: "2 days ago",
  },
];

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, Regional Officer. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400">{card.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart and Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Volunteer Hours Chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Volunteer Hours by Month</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volunteerHours}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  domain={[0, 350]}
                  ticks={[0, 70, 140, 210, 280, 350]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value}h`, "Hours"]}
                />
                <Bar
                  dataKey="hours"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Youth Leaders</span>
                <span className="text-lg font-bold text-gray-900">3</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Active</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tasks Assigned</span>
                <span className="text-lg font-bold text-gray-900">45</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-blue-600 font-medium">Registered</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Events This Month</span>
                <span className="text-lg font-bold text-gray-900">2</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-xs text-orange-600 font-medium">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Tasks */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">My Upcoming Tasks</h2>
            <button className="text-xs font-medium text-orange-500 flex items-center gap-0.5 hover:text-orange-600 transition-colors">
              View all <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="mt-1">
                  <Clock size={14} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Due: {task.due}</p>
                </div>
                <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${task.statusBg} ${task.statusColor}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
            <Activity size={16} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="mt-1">
                  <div className="h-2 w-2 rounded-full bg-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Juan Dela Cruz</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">Regional VP-A Officer</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Last updated: Today</span>
        </div>
      </div>
    </div>
  );
}