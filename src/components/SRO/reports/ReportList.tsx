"use client";

import { useState } from "react";
import { Search, Filter, Download, ChevronRight, User } from "lucide-react";

type ReportStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

type Report = {
  id: string;
  title: string;
  ro: string;
  roInitials: string;
  roColor: string;
  submitted: string;
  status: ReportStatus;
};

const initialReports: Report[] = [
  {
    id: "1",
    title: "Q2 Youth Leader Progress Report",
    ro: "Pedro Manalo",
    roInitials: "PM",
    roColor: "bg-red-400",
    submitted: "Aug 1, 2026",
    status: "Pending",
  },
  {
    id: "2",
    title: "Community Outreach Summary",
    ro: "Rosa Bautista",
    roInitials: "RB",
    roColor: "bg-orange-400",
    submitted: "Jul 28, 2026",
    status: "Under Review",
  },
  {
    id: "3",
    title: "Volunteer Engagement Report",
    ro: "Felipe Torres",
    roInitials: "FT",
    roColor: "bg-blue-500",
    submitted: "Jul 25, 2026",
    status: "Approved",
  },
  {
    id: "4",
    title: "Monthly Activity Log",
    ro: "Gloria Mendoza",
    roInitials: "GM",
    roColor: "bg-emerald-500",
    submitted: "Jul 30, 2026",
    status: "Pending",
  },
  {
    id: "5",
    title: "Event Post-Evaluation",
    ro: "Ramon Aquino",
    roInitials: "RA",
    roColor: "bg-orange-500",
    submitted: "Aug 2, 2026",
    status: "Rejected",
  },
];

const statusStyles: Record<ReportStatus, string> = {
  Pending: "bg-amber-100 text-amber-600",
  "Under Review": "bg-purple-100 text-purple-600",
  Approved: "bg-emerald-100 text-emerald-600",
  Rejected: "bg-red-100 text-red-500",
};

// const statusBadgeColors: Record<ReportStatus, string> = {
//   Pending: "bg-amber-500",
//   "Under Review": "bg-purple-500",
//   Approved: "bg-emerald-500",
//   Rejected: "bg-red-500",
// };

export function ReportList() {
  const [reports] = useState<Report[]>(initialReports);
  const [search, setSearch] = useState("");

  const filtered = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.ro.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusCount = (status: ReportStatus) => {
    return reports.filter((r) => r.status === status).length;
  };

  const statusCounts = [
    { label: "Pending", count: getStatusCount("Pending"), color: "bg-amber-500" },
    { label: "Under Review", count: getStatusCount("Under Review"), color: "bg-purple-500" },
    { label: "Approved", count: getStatusCount("Approved"), color: "bg-emerald-500" },
    { label: "Rejected", count: getStatusCount("Rejected"), color: "bg-red-500" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500">
          Review and approve reports submitted by your ROs.
        </p>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-3 mb-5">
        {statusCounts.map((status) => (
          <div
            key={status.label}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm"
          >
            <span className={`h-2 w-2 rounded-full ${status.color}`} />
            <span className="text-sm font-medium text-gray-700">{status.label}</span>
            <span className="text-sm font-semibold text-gray-900">{status.count}</span>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search reports..."
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
                  Report Title
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  RO
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Submitted
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
              {filtered.map((report) => (
                <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {report.title}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ${report.roColor}`}
                      >
                        {report.roInitials}
                      </div>
                      <span className="text-sm text-gray-600">{report.ro}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {report.submitted}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[report.status]}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {report.status === "Pending" || report.status === "Under Review" ? (
                        <>
                          <button className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors">
                            Approve
                          </button>
                          <button className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    No reports match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} className="text-gray-400" />
            <span className="font-medium">Sarah Johnson</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400">Senior RO</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Showing {filtered.length} reports</span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}