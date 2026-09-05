"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

type Report = {
  id: string;
  title: string;
  dateSubmitted: string;
  status: Status;
};

const initialReports: Report[] = [
  {
    id: "1",
    title: "Q3 Community Outreach Impact Assessment",
    dateSubmitted: "Oct 12, 2026",
    status: "Approved",
  },
  {
    id: "2",
    title: "Youth Leadership Seminar Financial Breakdown",
    dateSubmitted: "Oct 08, 2026",
    status: "Pending",
  },
  {
    id: "3",
    title: "Barangay Calios Disaster Drill Post-Event Report",
    dateSubmitted: "Sep 28, 2026",
    status: "Approved",
  },
  {
    id: "4",
    title: "Monthly Incident Log & Regional Safety Audit",
    dateSubmitted: "Sep 25, 2026",
    status: "Rejected",
  },
  {
    id: "5",
    title: "Volunteer Attendance & Hours Rendered - September",
    dateSubmitted: "Sep 01, 2026",
    status: "Approved",
  },
];

const statusStyles: Record<Status, string> = {
  Approved: "bg-emerald-100 text-emerald-600",
  Pending: "bg-amber-100 text-amber-600",
  Rejected: "bg-red-100 text-red-500",
};

const statusIcons: Record<Status, React.ReactNode> = {
  Approved: <CheckCircle size={14} className="text-emerald-500" />,
  Pending: <Clock size={14} className="text-amber-500" />,
  Rejected: <XCircle size={14} className="text-red-500" />,
};

export function ReportList() {
  const [reports] = useState<Report[]>(initialReports);
  const [search, setSearch] = useState("");

  const filtered = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500">
          Submit and track your regional reports.
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search + Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Reports..."
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
                  Date Submitted
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
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800">
                        {report.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{report.dateSubmitted}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {statusIcons[report.status]}
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[report.status]}`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`View ${report.title}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${report.title}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${report.title}`}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
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
            <span className="font-medium">Total Reports:</span>
            <span className="text-gray-900 font-semibold">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>1-{filtered.length} of {filtered.length}</span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}