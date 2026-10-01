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
  Tooltip,
} from "recharts";
import type { DashboardSummary } from "./dashboard.types";

type DashboardChartsProps = {
  volunteerGrowth: DashboardSummary["volunteerGrowth"];
  volunteersByRegion: DashboardSummary["volunteersByRegion"];
};

const tooltipStyle = { fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" };

export function DashboardCharts({ volunteerGrowth, volunteersByRegion }: DashboardChartsProps) {
  const maxGrowth = Math.max(1, ...volunteerGrowth.map((point) => point.value));
  const growthDomainMax = Math.ceil(maxGrowth / 4) * 4 || 4;
  const totalVolunteers = volunteersByRegion.reduce((sum, region) => sum + region.value, 0);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Volunteer Growth</h2>
        <p className="mb-4 text-xs text-gray-400">Total registered volunteers at the end of each month</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volunteerGrowth}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#EEF0F2" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                domain={[0, growthDomainMax]}
              />
              <Tooltip
                cursor={{ fill: "#F9FAFB" }}
                contentStyle={tooltipStyle}
                formatter={(value) => [value, "Volunteers"]}
              />
              <Bar dataKey="value" name="Volunteers" fill="#EA580C" radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-gray-900">Volunteers by Region</h2>
        {volunteersByRegion.length === 0 ? (
          <p className="flex h-72 items-center justify-center text-sm text-gray-400">No volunteers yet.</p>
        ) : (
          <>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={volunteersByRegion} dataKey="value" nameKey="name" outerRadius={90} stroke="#fff" strokeWidth={2}>
                    {volunteersByRegion.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} volunteers`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-1.5">
              {volunteersByRegion.map((region) => (
                <li key={region.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: region.color }} />
                    {region.name}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {region.value} ({Math.round((region.value / totalVolunteers) * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
