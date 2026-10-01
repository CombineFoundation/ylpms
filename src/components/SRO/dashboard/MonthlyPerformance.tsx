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
import type { SRODashboardSummary } from "./dashboard.types";

const SERIES = [
  { key: "tasksCompleted", label: "Tasks completed", color: "#10b981", dot: "bg-emerald-500" },
  { key: "reportsSubmitted", label: "Reports submitted", color: "#f97316", dot: "bg-orange-500" },
  { key: "activitiesCompleted", label: "Activities completed", color: "#6366f1", dot: "bg-indigo-500" },
] as const;

type MonthlyPerformanceProps = {
  data: SRODashboardSummary["monthlyActivity"];
  /** e.g. "My reports submitted" for a youth leader, whose own reports are counted. */
  reportsLabel?: string;
};

export function MonthlyPerformance({ data, reportsLabel }: MonthlyPerformanceProps) {
  const series = SERIES.map((s) => (s.key === "reportsSubmitted" && reportsLabel ? { ...s, label: reportsLabel } : s));
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Monthly Performance</h2>
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            {series.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        {series.map((line) => (
          <span key={line.key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${line.dot}`} />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  );
}
