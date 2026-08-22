"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";

type ActivityStatus = "Pending" | "Submitted" | "Under Review" | "Approved" | "In Progress" | "Completed" | "Rejected";

type Activity = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  youthLeader: string;
  participants: number;
  status: ActivityStatus;
  createdAt: string;
};

const initialActivities: Activity[] = [
  {
    id: "1",
    title: "Community Clean-Up Drive",
    description: "A city-wide environmental initiative to clean up public parks and streets.",
    date: "Aug 18, 2025",
    location: "Cushion Park, Karachi",
    youthLeader: "Zainab Ali",
    participants: 34,
    status: "Approved",
    createdAt: "2025-08-01",
  },
  {
    id: "2",
    title: "Youth Leadership Workshop",
    description: "A one-day intensive workshop on leadership skills and community engagement.",
    date: "Aug 22, 2025",
    location: "Foundation HQ, Lahore",
    youthLeader: "Ahmed Farooq",
    participants: 20,
    status: "Pending",
    createdAt: "2025-08-05",
  },
  {
    id: "3",
    title: "Volunteer Appreciation Day",
    description: "Annual event recognizing top volunteers for their outstanding contributions.",
    date: "Aug 30, 2025",
    location: "City Hall, Islamabad",
    youthLeader: "Multiple",
    participants: 65,
    status: "Approved",
    createdAt: "2025-07-20",
  },
  {
    id: "4",
    title: "Health Awareness Campaign",
    description: "Door-to-door health awareness drive in underprivileged neighborhoods.",
    date: "Jul 28, 2025",
    location: "Lyari, Karachi",
    youthLeader: "Fatima Noor",
    participants: 42,
    status: "Completed",
    createdAt: "2025-07-10",
  },
  {
    id: "5",
    title: "Youth Tech Workshop",
    description: "Hands-on coding and digital skills workshop for youth volunteers.",
    date: "Jul 15, 2025",
    location: "Tech Hub, Lahore",
    youthLeader: "Zainab Ali",
    participants: 28,
    status: "Completed",
    createdAt: "2025-07-01",
  },
  {
    id: "6",
    title: "Tree Plantation Drive",
    description: "Environmental sustainability initiative planting 500 saplings across the city.",
    date: "Sep 5, 2025",
    location: "Model Town Park, Lahore",
    youthLeader: "Ali Hassan",
    participants: 55,
    status: "Pending",
    createdAt: "2025-08-10",
  },
];

const youthLeaders = ["Zainab Ali", "Ahmed Farooq", "Fatima Noor", "Ali Hassan", "Multiple"];

const statusStyles: Record<ActivityStatus, string> = {
  Pending: "bg-amber-100 text-amber-600",
  Submitted: "bg-purple-100 text-purple-600",
  "Under Review": "bg-indigo-100 text-indigo-600",
  Approved: "bg-emerald-100 text-emerald-600",
  "In Progress": "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-500",
};

const statusIcons: Record<ActivityStatus, React.ReactNode> = {
  Pending: <Clock size={14} className="text-amber-500" />,
  Submitted: <Clock size={14} className="text-purple-500" />,
  "Under Review": <AlertCircle size={14} className="text-indigo-500" />,
  Approved: <CheckCircle size={14} className="text-emerald-500" />,
  "In Progress": <AlertCircle size={14} className="text-blue-500" />,
  Completed: <CheckCircle size={14} className="text-green-500" />,
  Rejected: <XCircle size={14} className="text-red-500" />,
};

export function ActivityList() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ActivityStatus | "All">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);

  // New Activity Form State
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    youthLeader: "",
    participants: 0,
    status: "Pending" as ActivityStatus,
  });

  const statusCounts = {
    total: activities.length,
    approved: activities.filter((a) => a.status === "Approved").length,
    pending: activities.filter((a) => a.status === "Pending").length,
    completed: activities.filter((a) => a.status === "Completed").length,
  };

  const filtered = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.description.toLowerCase().includes(search.toLowerCase()) ||
      activity.location.toLowerCase().includes(search.toLowerCase()) ||
      activity.youthLeader.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
    setIsDeleteModalOpen(false);
    setSelectedActivity(null);
  };

  const handleStatusChange = (id: string, newStatus: ActivityStatus) => {
    setActivities(
      activities.map((a) =>
        a.id === id ? { ...a, status: newStatus } : a
      )
    );
  };

  const handleCreateActivity = () => {
    if (!newActivity.title || !newActivity.date || !newActivity.location) {
      alert("Please fill in all required fields (Title, Date, and Location)");
      return;
    }

    const activity: Activity = {
      id: Date.now().toString(),
      title: newActivity.title,
      description: newActivity.description || "No description provided.",
      date: newActivity.date,
      location: newActivity.location,
      youthLeader: newActivity.youthLeader || "Unassigned",
      participants: newActivity.participants || 0,
      status: newActivity.status,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setActivities([activity, ...activities]);
    setIsNewActivityModalOpen(false);
    setNewActivity({
      title: "",
      description: "",
      date: "",
      location: "",
      youthLeader: "",
      participants: 0,
      status: "Pending",
    });
  };

  const getStatusCount = (status: ActivityStatus | "All") => {
    if (status === "All") return activities.length;
    return activities.filter((a) => a.status === status).length;
  };

  const ActivityCard = ({ activity }: { activity: Activity }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-800">{activity.title}</h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[activity.status]}`}
        >
          {statusIcons[activity.status]}
          {activity.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{activity.description}</p>
      <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-gray-400" />
          <span>{activity.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-gray-400" />
          <span>{activity.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <User size={12} className="text-gray-400" />
          <span>YL: {activity.youthLeader}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={12} className="text-gray-400" />
          <span>{activity.participants} participants</span>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => {
            setSelectedActivity(activity);
            setIsViewModalOpen(true);
          }}
          className="flex items-center gap-1 text-xs font-medium text-[#E8622C] hover:text-[#d45520] transition-colors"
        >
          <Eye size={14} />
          View
        </button>
        <button
          onClick={() => {
            setSelectedActivity(activity);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          onClick={() => {
            setSelectedActivity(activity);
            setIsDeleteModalOpen(true);
          }}
          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Activities</h1>
        <p className="text-sm text-gray-500">
          Main YLP activities and events management
        </p>
      </div>

      {/* Activity Workflow */}
      <div className="mb-5 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Activity Workflow
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {["Create", "Submit", "Review", "Approve", "Conduct", "Submit Evidence", "Verify", "Certificates"].map(
            (step, index) => (
              <div key={step} className="flex items-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8622C] text-white font-semibold text-[10px]">
                  {index + 1}
                </span>
                <span className="ml-1.5 text-gray-600">{step}</span>
                {index < 7 && (
                  <ChevronRight size={14} className="mx-1 text-gray-300" />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
          <p className="text-xs text-gray-500">Total Activities</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{statusCounts.approved}</p>
          <p className="text-xs text-gray-500">Approved</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{statusCounts.pending}</p>
          <p className="text-xs text-gray-500">Pending Review</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
          <p className="text-xs text-gray-500">Completed</p>
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
            placeholder="Search activities..."
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
                {["All", "Pending", "Submitted", "Under Review", "Approved", "In Progress", "Completed", "Rejected"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status as ActivityStatus | "All");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        filterStatus === status ? "text-[#E8622C] font-medium" : "text-gray-600"
                      }`}
                    >
                      {status} ({getStatusCount(status as ActivityStatus | "All")})
                    </button>
                  )
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsNewActivityModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#E8622C] px-4 py-2 rounded-lg hover:bg-[#d45520] transition-colors"
          >
            <Plus size={15} />
            New Activity
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["All", "Pending", "Approved", "Completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as ActivityStatus | "All")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filterStatus === status
                ? "bg-[#E8622C] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status} ({getStatusCount(status as ActivityStatus | "All")})
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-gray-400">
            No activities match your search.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 px-5 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Total Activities:</span>
          <span className="text-gray-900 font-semibold">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Showing {filtered.length} activities</span>
        </div>
      </div>

      {/* New Activity Modal */}
      {isNewActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Create New Activity</h2>
              <button
                onClick={() => setIsNewActivityModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, title: e.target.value })
                  }
                  placeholder="Enter activity title"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, description: e.target.value })
                  }
                  placeholder="Enter activity description"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, location: e.target.value })
                  }
                  placeholder="Enter activity location"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Youth Leader
                </label>
                <select
                  value={newActivity.youthLeader}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, youthLeader: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                >
                  <option value="">Select Youth Leader</option>
                  {youthLeaders.map((leader) => (
                    <option key={leader} value={leader}>
                      {leader}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Participants
                </label>
                <input
                  type="number"
                  value={newActivity.participants || ""}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      participants: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Number of participants"
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={newActivity.status}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      status: e.target.value as ActivityStatus,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setIsNewActivityModalOpen(false);
                  setNewActivity({
                    title: "",
                    description: "",
                    date: "",
                    location: "",
                    youthLeader: "",
                    participants: 0,
                    status: "Pending",
                  });
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateActivity}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
              >
                Create Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Edit Activity</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedActivity(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  defaultValue={selectedActivity.title}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea
                  defaultValue={selectedActivity.description}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  defaultValue={selectedActivity.status}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                >
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedActivity(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedActivity(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{selectedActivity.title}</h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedActivity(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[selectedActivity.status]}`}
            >
              {statusIcons[selectedActivity.status]}
              {selectedActivity.status}
            </span>
            <p className="text-sm text-gray-600 mt-3">{selectedActivity.description}</p>
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar size={14} />
                <span>{selectedActivity.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={14} />
                <span>{selectedActivity.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <User size={14} />
                <span>YL: {selectedActivity.youthLeader}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users size={14} />
                <span>{selectedActivity.participants} participants</span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedActivity(null);
              }}
              className="w-full mt-6 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Activity</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{selectedActivity.title}"? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedActivity(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedActivity.id)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}