"use client";

import {
  Users,
  CalendarDays,
  FileText,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const statCards = [
  {
    label: "Total Users",
    value: "404",
    change: "+12% vs last month",
    positive: true,
    icon: Users,
  },
  {
    label: "Events This Month",
    value: "32",
    change: "+8 vs last Month",
    positive: true,
    icon: CalendarDays,
  },
  {
    label: "Reports Filed",
    value: "87",
    change: "+5 this month",
    positive: true,
    icon: FileText,
  },
  {
    label: "Tasks Completed",
    value: "61",
    change: "-3 vs last month",
    positive: false,
    icon: ClipboardCheck,
  },
];

const volunteerGrowth = [
  { month: "Feb", value: 240 },
  { month: "Mar", value: 260 },
  { month: "Apr", value: 280 },
  { month: "May", value: 300 },
  { month: "Jun", value: 320 },
  { month: "Jul", value: 360 },
  { month: "Aug", value: 350 },
];

const eventsPerMonth = [
  { month: "Feb", value: 3 },
  { month: "Mar", value: 4 },
  { month: "Apr", value: 5 },
  { month: "May", value: 4 },
  { month: "Jun", value: 6 },
  { month: "Jul", value: 9 },
  { month: "Aug", value: 8 },
];

const regionData = [
  { name: "NCR", value: 34, color: "#f97316" },
  { name: "Region III", value: 19, color: "#fb923c" },
  { name: "Region IV-A", value: 41, color: "#fed7aa" },
  { name: "Region VII", value: 22, color: "#1e3a5f" },
  { name: "Region XI", value: 16, color: "#2563eb" },
];

export function AnalyticsContent() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
        <p className="text-sm text-gray-500">
          Performance insights across all regions.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {statCards.map(({ label, value, change, positive, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Icon size={15} className="text-orange-500" />
              </div>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
            <div className="flex items-center gap-1">
              {positive ? (
                <TrendingUp size={11} className="text-green-500" />
              ) : (
                <TrendingDown size={11} className="text-red-400" />
              )}
              <span
                className={`text-[10px] font-medium ${
                  positive ? "text-green-500" : "text-red-400"
                }`}
              >
                {change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Line chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            Monthly Volunteer Growth
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={volunteerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 600]}
                ticks={[0, 150, 300, 450, 600]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 3, fill: "#f97316" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            Events per Month
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={eventsPerMonth} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 12]}
                ticks={[0, 3, 6, 9, 12]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar dataKey="value" fill="#1e3a5f" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-4">
          Volunteer Distribution by Region
        </h2>
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0">
            <PieChart width={200} height={180}>
              <Pie
                data={regionData}
                cx={95}
                cy={85}
                innerRadius={0}
                outerRadius={80}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {regionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 flex-1">
            {regionData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {item.value} volunteers
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}