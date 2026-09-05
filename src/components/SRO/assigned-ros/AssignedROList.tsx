"use client";

import { useState } from "react";
import { Search, Filter, Download, Plus, ChevronRight } from "lucide-react";

type Status = "Active" | "Inactive";

type RO = {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  region: string;
  youthLeaders: number;
  pendingTasks: number;
  reports: number;
  performance: number;
  status: Status;
};

const initialROs: RO[] = [
  {
    id: "1",
    name: "Pedro Manalo",
    initials: "PM",
    avatarBg: "bg-red-400",
    region: "NCR - Quezon City",
    youthLeaders: 8,
    pendingTasks: 3,
    reports: 5,
    performance: 87,
    status: "Active",
  },
  {
    id: "2",
    name: "Rosa Bautista",
    initials: "RB",
    avatarBg: "bg-orange-400",
    region: "NCR - Manila",
    youthLeaders: 6,
    pendingTasks: 1,
    reports: 4,
    performance: 92,
    status: "Active",
  },
  {
    id: "3",
    name: "Felipe Torres",
    initials: "FT",
    avatarBg: "bg-blue-500",
    region: "NCR - Caloocan",
    youthLeaders: 4,
    pendingTasks: 5,
    reports: 2,
    performance: 61,
    status: "Inactive",
  },
  {
    id: "4",
    name: "Gloria Mendoza",
    initials: "GM",
    avatarBg: "bg-emerald-500",
    region: "NCR - Pasig",
    youthLeaders: 7,
    pendingTasks: 2,
    reports: 6,
    performance: 78,
    status: "Active",
  },
  {
    id: "5",
    name: "Ramon Aquino",
    initials: "RA",
    avatarBg: "bg-orange-500",
    region: "NCR - Makati",
    youthLeaders: 5,
    pendingTasks: 4,
    reports: 3,
    performance: 70,
    status: "Active",
  },
];

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-100 text-emerald-600",
  Inactive: "bg-gray-100 text-gray-400",
};

function getPerformanceColor(performance: number): string {
  if (performance >= 80) return "text-emerald-600";
  if (performance >= 70) return "text-amber-600";
  return "text-red-500";
}

export function AssignedROList() {
  const [ros] = useState<RO[]>(initialROs);
  const [search, setSearch] = useState("");

  const filtered = ros.filter(
    (ro) =>
      ro.name.toLowerCase().includes(search.toLowerCase()) ||
      ro.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Assigned Reporting Officers</h1>
        <p className="text-sm text-gray-500">
          Manage your 5 assigned ROs.
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search + Filter + Export bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search ROs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={15} />
              Filter
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={15} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Profile
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Region
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Youth Leaders
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Pending Tasks
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Reports
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Performance
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ro) => (
                <tr key={ro.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${ro.avatarBg}`}
                      >
                        {ro.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{ro.name}</p>
                        <p className="text-xs text-gray-400">Reporting Officer</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {ro.region}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {ro.youthLeaders}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {ro.pendingTasks}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {ro.reports}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-semibold ${getPerformanceColor(ro.performance)}`}>
                      {ro.performance}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[ro.status]}`}
                    >
                      {ro.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors whitespace-nowrap">
                      Assign Task
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    No ROs match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
              <Plus size={16} />
              Add RO
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
              <Plus size={16} />
              Assign Task
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>1-5 of 5</span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}