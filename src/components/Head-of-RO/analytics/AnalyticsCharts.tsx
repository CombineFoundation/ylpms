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
import type { AnalyticsSummary } from "./analytics.types";

type AnalyticsChartsProps = {
  userGrowth: AnalyticsSummary["userGrowth"];
  activitiesPerMonth: AnalyticsSummary["activitiesPerMonth"];
  volunteersByRegion: AnalyticsSummary["volunteersByRegion"];
};

const tooltipStyle = { fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" };

export function AnalyticsCharts({ userGrowth, activitiesPerMonth, volunteersByRegion }: AnalyticsChartsProps) {
  const userGrowthMax = Math.max(1, ...userGrowth.map((point) => point.value));
  const userGrowthDomainMax = Math.ceil(userGrowthMax / 4) * 4 || 4;

  const activitiesMax = Math.max(1, ...activitiesPerMonth.map((point) => point.value));
  const activitiesDomainMax = Math.ceil(activitiesMax / 3) * 3 || 3;

  const totalVolunteers = volunteersByRegion.reduce((sum, region) => sum + region.value, 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800">Total Users</h2>
          <p className="mb-4 text-xs text-gray-400">Registered users at the end of each month</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, userGrowthDomainMax]}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Users"]} />
              <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800">Activities per Month</h2>
          <p className="mb-4 text-xs text-gray-400">Activities starting in each month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activitiesPerMonth} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, activitiesDomainMax]}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Activities"]} />
              <Bar dataKey="value" fill="#1e3a5f" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-800">Volunteer Distribution by Region</h2>
        {volunteersByRegion.length === 0 ? (
          <p className="text-xs text-gray-400">No volunteers yet.</p>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            <div className="h-48 w-full max-w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={volunteersByRegion} outerRadius="90%" dataKey="value" nameKey="name" startAngle={90} endAngle={-270}>
                    {volunteersByRegion.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} volunteers`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex w-full flex-1 flex-col gap-3">
              {volunteersByRegion.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-gray-800">
                    {item.value} volunteer{item.value === 1 ? "" : "s"}
                    {totalVolunteers > 0 ? ` (${Math.round((item.value / totalVolunteers) * 100)}%)` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
