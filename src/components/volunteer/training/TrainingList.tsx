"use client";

import { useState } from "react";
import {
  Search,
  Play,
  FileText,
  Filter,
  ChevronDown,
  Eye,
  Download,
  Calendar,
  User,
  FolderOpen,
  Video,
  File,
  X,
  ExternalLink,
} from "lucide-react";

type ResourceType = "Video" | "PDF";
type Category = "Leadership" | "Community Engagement" | "Volunteer Management" | "Communication" | "Delegation" | "Team Motivation" | "Program Planning";

type TrainingResource = {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  type: ResourceType;
  category: Category;
  url?: string;
  duration?: string;
  pages?: number;
  pdfUrl?: string;
  videoUrl?: string;
};

// 📌 ADD YOUR PDF URLs AND VIDEO URLs HERE
const initialResources: TrainingResource[] = [
  {
    id: "1",
    title: "Leadership Skills 101",
    description: "Fundamentals of effective youth leadership — communication, delegation, and team motivation.",
    author: "Ahmad Karim",
    date: "Aug 12, 2025",
    type: "Video",
    category: "Leadership",
    duration: "45:20",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "2",
    title: "Community Engagement Handbook",
    description: "A comprehensive guide to planning and executing successful community engagement programs.",
    author: "Sara Malik",
    date: "Aug 10, 2025",
    type: "PDF",
    category: "Community Engagement",
    pages: 45,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "3",
    title: "Volunteer Management Best Practices",
    description: "Strategies for recruiting, onboarding, retaining, and recognizing volunteers effectively.",
    author: "Ahmad Karim",
    date: "Aug 8, 2025",
    type: "Video",
    category: "Volunteer Management",
    duration: "38:15",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "4",
    title: "Effective Communication for Leaders",
    description: "Master the art of clear, empathetic, and persuasive communication in leadership roles.",
    author: "Zainab Ali",
    date: "Aug 5, 2025",
    type: "Video",
    category: "Communication",
    duration: "52:10",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "5",
    title: "Delegation Strategies Guide",
    description: "Learn how to delegate tasks effectively to maximize team productivity and growth.",
    author: "Ahmed Farooq",
    date: "Aug 3, 2025",
    type: "PDF",
    category: "Delegation",
    pages: 32,
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
  },
  {
    id: "6",
    title: "Team Motivation Techniques",
    description: "Proven techniques to inspire and motivate your team to achieve exceptional results.",
    author: "Fatima Noor",
    date: "Jul 30, 2025",
    type: "Video",
    category: "Team Motivation",
    duration: "41:30",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "7",
    title: "Program Planning Framework",
    description: "A step-by-step framework for planning and executing successful youth programs.",
    author: "Bilal Hussain",
    date: "Jul 28, 2025",
    type: "PDF",
    category: "Program Planning",
    pages: 28,
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
  },
  {
    id: "8",
    title: "Youth Empowerment Handbook",
    description: "Comprehensive guide to empowering youth through structured programs and mentorship.",
    author: "Sara Malik",
    date: "Jul 25, 2025",
    type: "PDF",
    category: "Leadership",
    pages: 50,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

const categories = ["All", "Leadership", "Community Engagement", "Volunteer Management", "Communication", "Delegation", "Team Motivation", "Program Planning"];

export function TrainingList() {
  const [resources] = useState<TrainingResource[]>(initialResources);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | ResourceType>("All");
  const [filterCategory, setFilterCategory] = useState<Category | "All">("All");
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<TrainingResource | null>(null);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  const videoCount = resources.filter((r) => r.type === "Video").length;
  const pdfCount = resources.filter((r) => r.type === "PDF").length;
  const categoryCount = [...new Set(resources.map((r) => r.category))].length;

  const filtered = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(search.toLowerCase()) ||
      resource.description.toLowerCase().includes(search.toLowerCase()) ||
      resource.author.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || resource.type === filterType;
    const matchesCategory = filterCategory === "All" || resource.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleViewPDF = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  const handleDownloadPDF = (pdfUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ResourceCard = ({ resource }: { resource: TrainingResource }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {resource.type === "Video" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-500">
              <Video size={16} />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-500">
              <File size={16} />
            </div>
          )}
          <h3 className="text-sm font-bold text-gray-800">{resource.title}</h3>
        </div>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            resource.type === "Video"
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {resource.type}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">{resource.description}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <User size={12} />
          <span>By {resource.author}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{resource.date}</span>
        </div>
        {resource.type === "Video" && resource.duration && (
          <div className="flex items-center gap-1">
            <Play size={12} />
            <span>{resource.duration}</span>
          </div>
        )}
        {resource.type === "PDF" && resource.pages && (
          <div className="flex items-center gap-1">
            <FileText size={12} />
            <span>{resource.pages} pages</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <FolderOpen size={12} />
          <span>{resource.category}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {resource.type === "Video" ? (
          <button
            onClick={() => {
              setSelectedResource(resource);
              setIsVideoPlayerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
          >
            <Play size={14} />
            Watch
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedResource(resource);
                setIsPdfViewerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
            >
              <Eye size={14} />
              View PDF
            </button>
            <button
              onClick={() => resource.pdfUrl && handleDownloadPDF(resource.pdfUrl, resource.title)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              Download
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Training Portal</h1>
        <p className="text-sm text-gray-500">
          Browse and watch training resources
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
          <p className="text-xs text-gray-500">Total Resources</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{videoCount}</p>
          <p className="text-xs text-gray-500">Videos</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{pdfCount}</p>
          <p className="text-xs text-gray-500">PDFs</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{categoryCount}</p>
          <p className="text-xs text-gray-500">Categories</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <button
            onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={15} />
            {filterType === "All" ? "All Types" : filterType}
            <ChevronDown size={14} />
          </button>
          {isTypeFilterOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-10">
              {["All", "Video", "PDF"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type as "All" | ResourceType);
                    setIsTypeFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    filterType === type ? "text-[#E8622C] font-medium" : "text-gray-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderOpen size={15} />
            {filterCategory === "All" ? "All Categories" : filterCategory}
            <ChevronDown size={14} />
          </button>
          {isCategoryFilterOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-10 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setFilterCategory(category as Category | "All");
                    setIsCategoryFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    filterCategory === category ? "text-[#E8622C] font-medium" : "text-gray-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Category Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {["All", "Leadership", "Community Engagement", "Volunteer Management"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat as Category | "All")}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-colors ${
                filterCategory === cat
                  ? "bg-[#E8622C] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-gray-400">
            No training resources match your search.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 px-5 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Total Resources:</span>
          <span className="text-gray-900 font-semibold">{filtered.length}</span>
          <span className="text-gray-400">|</span>
          <span className="text-xs text-gray-400">
            {filtered.filter((r) => r.type === "Video").length} Videos
          </span>
          <span className="text-xs text-gray-400">
            {filtered.filter((r) => r.type === "PDF").length} PDFs
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Showing {filtered.length} resources</span>
        </div>
      </div>

      {/* PDF Viewer Modal - Opens in New Tab instead of iframe */}
      {isPdfViewerOpen && selectedResource && selectedResource.pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedResource.title}</h2>
                <p className="text-xs text-gray-500">PDF Viewer</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => selectedResource.pdfUrl && handleDownloadPDF(selectedResource.pdfUrl, selectedResource.title)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  onClick={() => {
                    setIsPdfViewerOpen(false);
                    setSelectedResource(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-4 h-[70vh] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{selectedResource.title}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedResource.pages} pages · {selectedResource.category}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => selectedResource.pdfUrl && handleViewPDF(selectedResource.pdfUrl)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
                  >
                    <ExternalLink size={16} />
                    Open PDF in New Tab
                  </button>
                  <button
                    onClick={() => selectedResource.pdfUrl && handleDownloadPDF(selectedResource.pdfUrl, selectedResource.title)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  If the PDF doesn't open, click "Open PDF in New Tab" above
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end px-6 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsPdfViewerOpen(false);
                  setSelectedResource(null);
                }}
                className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {isVideoPlayerOpen && selectedResource && selectedResource.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedResource.title}</h2>
                <p className="text-xs text-gray-500">Video Player</p>
              </div>
              <button
                onClick={() => {
                  setIsVideoPlayerOpen(false);
                  setSelectedResource(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 bg-black">
              <div className="aspect-video">
                <iframe
                  src={selectedResource.videoUrl}
                  className="w-full h-full rounded-lg"
                  title={selectedResource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{selectedResource.duration}</span>
                <span>·</span>
                <span>{selectedResource.category}</span>
                <span>·</span>
                <span>By {selectedResource.author}</span>
              </div>
              <button
                onClick={() => {
                  setIsVideoPlayerOpen(false);
                  setSelectedResource(null);
                }}
                className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}