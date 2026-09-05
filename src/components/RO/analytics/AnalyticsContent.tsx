"use client";

import {
  Users,
  UserCheck,
  CheckCircle,
  TrendingUp,
  Activity,
  PieChart,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
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
    label: "Volunteers",
    value: "45",
    sub: "Registered",
    icon: UserCheck,
    color: "bg-blue-100 text-blue-500",
  },
  {
    label: "Tasks Completed",
    value: "18",
    sub: "Completed",
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-500",
  },
];

// Volunteer Growth Data
const volunteerGrowth = [
  { month: "Feb", value: 45 },
  { month: "Mar", value: 68 },
  { month: "Apr", value: 79 },
  { month: "May", value: 90 },
  { month: "Jun", value: 120 },
  { month: "Jul", value: 146 },
  { month: "Aug", value: 131 },
];

// Events per Month Data
const eventsPerMonth = [
  { month: "Feb", value: 1 },
  { month: "Mar", value: 3 },
  { month: "Apr", value: 2 },
  { month: "May", value: 4 },
  { month: "Jun", value: 5 },
  { month: "Jul", value: 3 },
  { month: "Aug", value: 6 },
];

// Skills Distribution Data
const skillsData = [
  { name: "First Aid", value: 40, color: "#f97316" },
  { name: "Event Mgmt", value: 10, color: "#3b82f6" },
  { name: "IT & Comm", value: 20, color: "#8b5cf6" },
  { name: "Logistics", value: 30, color: "#10b981" },
];

export function AnalyticsContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Performance insights and demographic metrics for your region.
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Volunteer Growth Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Volunteer Growth Trend</h2>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volunteerGrowth}>
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
                  domain={[0, 180]}
                  ticks={[0, 45, 90, 135, 180]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} volunteers`, "Growth"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#f97316" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events per Month Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Events Conducted per Month</h2>
            <Activity size={16} className="text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsPerMonth}>
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
                  domain={[0, 8]}
                  ticks={[0, 2, 4, 6, 8]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} events`, "Events"]}
                />
                <Bar
                  dataKey="value"
                  fill="#1E3A6E"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stats and Skills Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Stats */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Volunteers</span>
              <span className="text-lg font-bold text-gray-900">12</span>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tasks Completed</span>
                <span className="text-lg font-bold text-gray-900">18</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active Youth Leaders</span>
                <span className="text-lg font-bold text-gray-900">3</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Events This Year</span>
                <span className="text-lg font-bold text-gray-900">24</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Distribution - Pie Chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Volunteer Skills Distribution</h2>
            <PieChart size={16} className="text-gray-400" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-52 w-52">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={skillsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {skillsData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value}%`, "Distribution"]}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {skillsData.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: skill.color }}
                    />
                    <span className="text-sm text-gray-600">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${skill.value}%`,
                          backgroundColor: skill.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-10 text-right">
                      {skill.value}%
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                Based on 45 registered volunteers
              </div>
            </div>
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
          <span>Data updated: Today</span>
        </div>
      </div>
    </div>
  );
}