"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { month: "Feb", value: 18 },
  { month: "Mar", value: 27 },
  { month: "Apr", value: 24 },
  { month: "May", value: 30 },
  { month: "Jun", value: 33 },
  { month: "Jul", value: 36 },
  { month: "Aug", value: 32 },
];

export function MonthlyPerformance() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Monthly Performance</h2>
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Tasks &nbsp; Reports &nbsp; Events
      </div>
    </div>
  );
}