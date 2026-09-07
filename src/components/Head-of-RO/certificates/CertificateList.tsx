"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  Download,
  ChevronRight,
  Award,
  Calendar,
  User,
  FileText,
  Filter,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";

type Certificate = {
  id: string;
  title: string;
  description: string;
  certificateNumber: string;
  recipientName: string;
  recipientRole: string;
  activityDate: string;
  issuedDate: string;
  status: "Issued" | "Pending" | "Revoked";
  certificateUrl?: string;
};

const initialCertificates: Certificate[] = [
  {
    id: "1",
    title: "Certificate of Participation",
    description: "Community Clean-Up Drive",
    certificateNumber: "YLP-2025-0112",
    recipientName: "Zainab Ali",
    recipientRole: "Youth Leader",
    activityDate: "Jul 15, 2025",
    issuedDate: "Aug 10, 2025",
    status: "Issued",
    // 👇 Add your actual PDF URL here
    certificateUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "2",
    title: "Certificate of Participation",
    description: "Health Awareness Campaign",
    certificateNumber: "YLP-2025-0098",
    recipientName: "Zainab Ali",
    recipientRole: "Youth Leader",
    activityDate: "Jul 15, 2025",
    issuedDate: "Jul 30, 2025",
    status: "Issued",
    // 👇 Add your actual PDF URL here
    certificateUrl: "https://www.africau.edu/images/default/sample.pdf",
  },
];

const statusStyles = {
  Issued: "bg-emerald-100 text-emerald-600",
  Pending: "bg-amber-100 text-amber-600",
  Revoked: "bg-red-100 text-red-500",
};

export function CertificateList() {
  const [certificates] = useState<Certificate[]>(initialCertificates);
  const [search, setSearch] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"All" | "Issued" | "Pending" | "Revoked">("All");
  const [downloading, setDownloading] = useState<string | null>(null);

  const filtered = certificates.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(search.toLowerCase()) ||
      cert.description.toLowerCase().includes(search.toLowerCase()) ||
      cert.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || cert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCertificates = certificates.length;
  const thisMonthCertificates = certificates.filter((cert) => {
    const issuedDate = new Date(cert.issuedDate);
    const now = new Date();
    return issuedDate.getMonth() === now.getMonth() &&
           issuedDate.getFullYear() === now.getFullYear();
  }).length;

  const handleDownload = async (certificate: Certificate) => {
    if (!certificate.certificateUrl) {
      alert("No certificate URL available for download.");
      return;
    }

    setDownloading(certificate.id);

    try {
      // Fetch the PDF
      const response = await fetch(certificate.certificateUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;
      link.download = `${certificate.certificateNumber}_${certificate.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      
      // Fallback: Open in new tab if fetch fails
      if (certificate.certificateUrl) {
        window.open(certificate.certificateUrl, "_blank");
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleView = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsViewModalOpen(true);
  };

  const handleViewInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Certificates</h1>
        <p className="text-sm text-gray-500">
          Your earned activity certificates
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
              <Award size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCertificates}</p>
              <p className="text-xs text-gray-500">Certificates Earned</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-500">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{thisMonthCertificates}</p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-500">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter((c) => c.status === "Issued").length}
              </p>
              <p className="text-xs text-gray-500">Active Certificates</p>
            </div>
          </div>
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
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={15} />
            {filterStatus === "All" ? "All Status" : filterStatus}
            <ChevronDown size={14} />
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-10">
              {["All", "Issued", "Pending", "Revoked"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status as typeof filterStatus);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    filterStatus === status ? "text-[#E8622C] font-medium" : "text-gray-600"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            {/* Certificate Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{certificate.title}</h3>
                <p className="text-xs text-gray-500">{certificate.description}</p>
              </div>
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[certificate.status]}`}
              >
                {certificate.status}
              </span>
            </div>

            {/* Certificate Number */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
              <FileText size={12} />
              <span>{certificate.certificateNumber}</span>
            </div>

            {/* Recipient */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <User size={12} className="text-gray-400" />
              <span className="font-medium">{certificate.recipientName}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400">{certificate.recipientRole}</span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Activity: {certificate.activityDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={12} />
                <span>Issued: {certificate.issuedDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-100">
              <button
                onClick={() => handleView(certificate)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
              >
                <Eye size={14} />
                View
              </button>
              <button
                onClick={() => handleDownload(certificate)}
                disabled={downloading === certificate.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading === certificate.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {downloading === certificate.id ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-gray-400">
            No certificates match your search.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 px-5 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Total Certificates:</span>
          <span className="text-gray-900 font-semibold">{filtered.length}</span>
          <span className="text-gray-400">|</span>
          <span className="text-xs text-gray-400">
            {filtered.filter((c) => c.status === "Issued").length} Issued
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Showing {filtered.length} certificates</span>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* View Certificate Modal */}
      {isViewModalOpen && selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedCertificate.title}</h2>
                <p className="text-xs text-gray-500">{selectedCertificate.description}</p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedCertificate(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronDown size={24} className="rotate-90" />
              </button>
            </div>

            <div className="p-6">
              {/* Certificate Preview */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-6 bg-gradient-to-br from-orange-50 to-white">
                <div className="text-center">
                  <Award size={48} className="mx-auto text-[#E8622C] mb-3" />
                  <h3 className="text-xl font-bold text-gray-800">{selectedCertificate.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{selectedCertificate.description}</p>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-gray-600">Presented to</p>
                    <p className="text-lg font-bold text-gray-800">{selectedCertificate.recipientName}</p>
                    <p className="text-sm text-gray-500">{selectedCertificate.recipientRole}</p>
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
                    <div>
                      <span className="block font-medium text-gray-700">Activity Date</span>
                      {selectedCertificate.activityDate}
                    </div>
                    <div>
                      <span className="block font-medium text-gray-700">Issued Date</span>
                      {selectedCertificate.issuedDate}
                    </div>
                    <div>
                      <span className="block font-medium text-gray-700">Certificate No.</span>
                      {selectedCertificate.certificateNumber}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedCertificate.status]}`}
                    >
                      {selectedCertificate.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedCertificate(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedCertificate.certificateUrl && (
                  <button
                    onClick={() => handleViewInNewTab(selectedCertificate.certificateUrl!)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={16} className="inline mr-1" />
                    Open PDF
                  </button>
                )}
                <button
                  onClick={() => handleDownload(selectedCertificate)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
                >
                  <Download size={16} className="inline mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}