"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  ChevronRight,
  FileText,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Filter,
  ChevronDown,
  Plus,
} from "lucide-react";

type ReportStatus = "Pending" | "Under Review" | "Approved" | "Completed" | "Rejected";

type Report = {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  date: string;
  status: ReportStatus;
};

const initialReports: Report[] = [
  {
    id: "1",
    title: "August Branch Performance Review",
    description: "Q3 Program Review",
    submittedBy: "Sara Malik",
    date: "Aug 14, 2025",
    status: "Under Review",
  },
  {
    id: "2",
    title: "Community Clean-Up Drive Report",
    description: "Community Clean-Up Drive",
    submittedBy: "Zainab Ali",
    date: "Aug 10, 2025",
    status: "Approved",
  },
  {
    id: "3",
    title: "Health Awareness Campaign Report",
    description: "Health Awareness Campaign",
    submittedBy: "Fatima Noor",
    date: "Jul 30, 2025",
    status: "Approved",
  },
  {
    id: "4",
    title: "Youth Tech Workshop Summary",
    description: "Youth Tech Workshop",
    submittedBy: "Zainab Ali",
    date: "Jul 17, 2025",
    status: "Completed",
  },
  {
    id: "5",
    title: "Volunteer Orientation Report",
    description: "New Volunteer Batch",
    submittedBy: "Ahmed Farooq",
    date: "Aug 13, 2025",
    status: "Pending",
  },
  {
    id: "6",
    title: "Q2 Lahore District Review",
    description: "Q2 Program Review",
    submittedBy: "Bilal Hussain",
    date: "Jul 5, 2025",
    status: "Rejected",
  },
];

const statusStyles: Record<ReportStatus, string> = {
  Pending: "bg-amber-100 text-amber-600",
  "Under Review": "bg-indigo-100 text-indigo-600",
  Approved: "bg-emerald-100 text-emerald-600",
  Completed: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-500",
};

const statusIcons: Record<ReportStatus, React.ReactNode> = {
  Pending: <Clock size={14} className="text-amber-500" />,
  "Under Review": <AlertCircle size={14} className="text-indigo-500" />,
  Approved: <CheckCircle size={14} className="text-emerald-500" />,
  Completed: <CheckCircle size={14} className="text-green-500" />,
  Rejected: <XCircle size={14} className="text-red-500" />,
};

export function ReportList() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "All">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);

  // New Report Form State
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    submittedBy: "",
    date: "",
    status: "Pending" as ReportStatus,
  });

  const statusCounts = {
    total: reports.length,
    approved: reports.filter((r) => r.status === "Approved").length,
    underReview: reports.filter((r) => r.status === "Under Review").length,
    rejected: reports.filter((r) => r.status === "Rejected").length,
  };

  const filtered = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase()) ||
      report.submittedBy.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateReport = () => {
    if (!newReport.title || !newReport.submittedBy || !newReport.date) {
      alert("Please fill in all required fields (Title, Submitted By, and Date)");
      return;
    }

    const report: Report = {
      id: Date.now().toString(),
      title: newReport.title,
      description: newReport.description || "No description provided.",
      submittedBy: newReport.submittedBy,
      date: newReport.date,
      status: newReport.status,
    };

    setReports([report, ...reports]);
    setIsNewReportModalOpen(false);
    setNewReport({
      title: "",
      description: "",
      submittedBy: "",
      date: "",
      status: "Pending",
    });
  };

  const getStatusCount = (status: ReportStatus | "All") => {
    if (status === "All") return reports.length;
    return reports.filter((r) => r.status === status).length;
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500">
          Activity and program reports
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
          <p className="text-xs text-gray-500">Total Reports</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{statusCounts.approved}</p>
          <p className="text-xs text-gray-500">Approved</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{statusCounts.underReview}</p>
          <p className="text-xs text-gray-500">Under Review</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-500">{statusCounts.rejected}</p>
          <p className="text-xs text-gray-500">Rejected</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
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
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={15} />
              Filter
              <ChevronDown size={14} />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-10">
                {["All", "Pending", "Under Review", "Approved", "Completed", "Rejected"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status as ReportStatus | "All");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        filterStatus === status ? "text-[#E8622C] font-medium" : "text-gray-600"
                      }`}
                    >
                      {status} ({getStatusCount(status as ReportStatus | "All")})
                    </button>
                  )
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsNewReportModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#E8622C] px-4 py-2 rounded-lg hover:bg-[#d45520] transition-colors"
          >
            <Plus size={15} />
            New Report
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Report
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Submitted By
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
              {filtered.map((report) => (
                <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {report.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {report.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{report.submittedBy}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{report.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {statusIcons[report.status]}
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[report.status]}`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setIsViewModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-sm font-medium text-[#E8622C] hover:text-[#d45520] transition-colors"
                    >
                      <Eye size={15} />
                      View
                    </button>
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

      {/* View Report Modal */}
      {isViewModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedReport.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedReport.description}</p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedReport(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-gray-400" />
                <span className="text-gray-600">Submitted by:</span>
                <span className="font-medium text-gray-800">{selectedReport.submittedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-800">{selectedReport.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} className="text-gray-400" />
                <span className="text-gray-600">Status:</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[selectedReport.status]}`}
                >
                  {statusIcons[selectedReport.status]}
                  {selectedReport.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedReport(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Submit New Report</h2>
              <button
                onClick={() => {
                  setIsNewReportModalOpen(false);
                  setNewReport({
                    title: "",
                    description: "",
                    submittedBy: "",
                    date: "",
                    status: "Pending",
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Report Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) =>
                    setNewReport({ ...newReport, title: e.target.value })
                  }
                  placeholder="Enter report title"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) =>
                    setNewReport({ ...newReport, description: e.target.value })
                  }
                  placeholder="Enter report description"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Submitted By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newReport.submittedBy}
                  onChange={(e) =>
                    setNewReport({ ...newReport, submittedBy: e.target.value })
                  }
                  placeholder="Enter name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newReport.date}
                  onChange={(e) =>
                    setNewReport({ ...newReport, date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={newReport.status}
                  onChange={(e) =>
                    setNewReport({
                      ...newReport,
                      status: e.target.value as ReportStatus,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setIsNewReportModalOpen(false);
                  setNewReport({
                    title: "",
                    description: "",
                    submittedBy: "",
                    date: "",
                    status: "Pending",
                  });
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReport}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}