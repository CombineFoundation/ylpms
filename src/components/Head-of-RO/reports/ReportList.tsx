"use client";

import { useState } from "react";
import { Search, Download, Eye } from "lucide-react";

const statusStyles: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-500",
  Approved: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-500",
};

const reports = [
  {
    id: 1,
    title: "Q2 Volunteer Activity Report",
    submittedBy: "Pedro Manalo",
    region: "NCR",
    date: "Jul 5, 2026",
    status: "Pending",
  },
  {
    id: 2,
    title: "Regional Impact Assessment",
    submittedBy: "Gloria Mendoza",
    region: "Region IV-A",
    date: "Jul 12, 2026",
    status: "Approved",
  },
  {
    id: 3,
    title: "Youth Leader Progress Report",
    submittedBy: "Felipe Torres",
    region: "Region III",
    date: "Jul 20, 2026",
    status: "Rejected",
  },
  {
    id: 4,
    title: "Event Post-Evaluation Form",
    submittedBy: "Ramon Aquino",
    region: "Region VII",
    date: "Jul 28, 2026",
    status: "Pending",
  },
  {
    id: 5,
    title: "Volunteer Hours Summary",
    submittedBy: "Elena Pascual",
    region: "Region XI",
    date: "Aug 1, 2026",
    status: "Approved",
  },
];

export function ReportList() {
  const [search, setSearch] = useState("");
  const [reportList, setReportList] = useState(reports);

  const filtered = reportList.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.submittedBy.toLowerCase().includes(search.toLowerCase()) ||
      r.region.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id: number, status: string) => {
    setReportList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500">
          Review and approve submitted reports from ROs.
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search + Export bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
          <div className="relative w-64">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
            <Download size={13} />
            Export
          </button>
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
                  Submitted By
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Region
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Date
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
              {filtered.map((report, idx) => (
                <tr
                  key={report.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    idx === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-5 py-3.5 font-semibold text-gray-800 text-xs whitespace-nowrap">
                    {report.title}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                    {report.submittedBy}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                    {report.region}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                    {report.date}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        statusStyles[report.status]
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      {report.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(report.id, "Approved")
                            }
                            className="text-[11px] font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-md transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateStatus(report.id, "Rejected")
                            }
                            className="text-[11px] font-semibold text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1 rounded-md transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}