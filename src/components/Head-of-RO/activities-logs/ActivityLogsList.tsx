"use client";

import React, { useState, useEffect } from "react";
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
  Download,
  MoreVertical,
  Activity,
  History,
  RefreshCw,
  Info,
  Edit,
  FileText,
  UserCheck,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  DollarSign,
  Users as UsersIcon,
  CheckSquare,
  AlertTriangle,
  Bell,
} from "lucide-react";

// Types
type ActivityStatus = 
  | "Pending" 
  | "Submitted" 
  | "Under Review" 
  | "Approved" 
  | "In Progress" 
  | "Completed" 
  | "Rejected";

type ActivityType = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  Head_RO: string;
  participants: number;
  status: ActivityStatus;
  createdAt: string;
  category?: string;
  budget?: number;
  volunteers?: number;
  updatedAt?: string;
  createdBy?: string;
};

type LogEntry = {
  id: string;
  activityId: string;
  action: "created" | "updated" | "deleted" | "status_changed" | "participant_added" | "participant_removed" | "budget_updated" | "volunteer_updated";
  description: string;
  timestamp: string;
  user: string;
  changes?: {
    field: string;
    from: any;
    to: any;
  }[];
  activityTitle?: string;
};

type FilterType = "all" | "created" | "updated" | "deleted" | "status_changed";

// Initial Activities
const initialActivities: ActivityType[] = [
  {
    id: "1",
    title: "Community Clean-Up Drive",
    description: "A city-wide environmental initiative to clean up public parks and streets.",
    date: "Aug 18, 2025",
    location: "Cushion Park, Karachi",
    Head_RO: "Zainab Ali",
    participants: 34,
    status: "Approved",
    createdAt: "2025-08-01T10:30:00",
    category: "Environment",
    budget: 2500,
    volunteers: 28,
    createdBy: "Zainab Ali",
    updatedAt: "2025-08-05T14:20:00",
  },
  {
    id: "2",
    title: "Head of ROship Workshop",
    description: "A one-day intensive workshop on leadership skills and community engagement.",
    date: "Aug 22, 2025",
    location: "Foundation HQ, Lahore",
    Head_RO: "Ahmed Farooq",
    participants: 20,
    status: "Pending",
    createdAt: "2025-08-05T09:15:00",
    category: "Education",
    budget: 5000,
    volunteers: 15,
    createdBy: "Ahmed Farooq",
    updatedAt: "2025-08-06T11:30:00",
  },
  {
    id: "3",
    title: "Volunteer Appreciation Day",
    description: "Annual event recognizing top volunteers for their outstanding contributions.",
    date: "Aug 30, 2025",
    location: "City Hall, Islamabad",
    Head_RO: "Multiple",
    participants: 65,
    status: "Approved",
    createdAt: "2025-07-20T08:00:00",
    category: "Recognition",
    budget: 8000,
    volunteers: 55,
    createdBy: "Ali Hassan",
    updatedAt: "2025-07-25T16:45:00",
  },
  {
    id: "4",
    title: "Health Awareness Campaign",
    description: "Door-to-door health awareness drive in underprivileged neighborhoods.",
    date: "Jul 28, 2025",
    location: "Lyari, Karachi",
    Head_RO: "Fatima Noor",
    participants: 42,
    status: "Completed",
    createdAt: "2025-07-10T11:00:00",
    category: "Health",
    budget: 3000,
    volunteers: 35,
    createdBy: "Fatima Noor",
    updatedAt: "2025-07-29T18:30:00",
  },
  {
    id: "5",
    title: "Youth Tech Workshop",
    description: "Hands-on coding and digital skills workshop for youth volunteers.",
    date: "Jul 15, 2025",
    location: "Tech Hub, Lahore",
    Head_RO: "Zainab Ali",
    participants: 28,
    status: "Completed",
    createdAt: "2025-07-01T14:00:00",
    category: "Education",
    budget: 3500,
    volunteers: 22,
    createdBy: "Zainab Ali",
    updatedAt: "2025-07-16T09:00:00",
  },
  {
    id: "6",
    title: "Tree Plantation Drive",
    description: "Environmental sustainability initiative planting 500 saplings across the city.",
    date: "Sep 5, 2025",
    location: "Model Town Park, Lahore",
    Head_RO: "Ali Hassan",
    participants: 55,
    status: "Pending",
    createdAt: "2025-08-10T07:30:00",
    category: "Environment",
    budget: 4000,
    volunteers: 45,
    createdBy: "Ali Hassan",
    updatedAt: "2025-08-12T13:15:00",
  },
];

// Generate automatic logs based on activities
const generateInitialLogs = (activities: ActivityType[]): LogEntry[] => {
  const logs: LogEntry[] = [];
  
  activities.forEach((activity) => {
    // Creation log
    logs.push({
      id: `log-${activity.id}-created`,
      activityId: activity.id,
      action: "created",
      description: `Activity "${activity.title}" was created`,
      timestamp: activity.createdAt,
      user: activity.createdBy || "System",
      activityTitle: activity.title,
    });
    
    // Update log if updatedAt exists
    if (activity.updatedAt) {
      logs.push({
        id: `log-${activity.id}-updated`,
        activityId: activity.id,
        action: "updated",
        description: `Activity "${activity.title}" was updated`,
        timestamp: activity.updatedAt,
        user: activity.createdBy || "System",
        activityTitle: activity.title,
        changes: [
          {
            field: "status",
            from: "Pending",
            to: activity.status,
          },
        ],
      });
    }
  });
  
  // Sort by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Status styles
const statusStyles: Record<ActivityStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Submitted: "bg-purple-100 text-purple-700",
  "Under Review": "bg-indigo-100 text-indigo-700",
  Approved: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
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

const actionIcons: Record<string, React.ReactNode> = {
  created: <Plus size={16} className="text-green-500" />,
  updated: <Edit size={16} className="text-blue-500" />,
  deleted: <Trash2 size={16} className="text-red-500" />,
  status_changed: <RefreshCw size={16} className="text-purple-500" />,
  participant_added: <UsersIcon size={16} className="text-indigo-500" />,
  participant_removed: <UsersIcon size={16} className="text-orange-500" />,
  budget_updated: <DollarSign size={16} className="text-emerald-500" />,
  volunteer_updated: <UserCheck size={16} className="text-cyan-500" />,
};

const actionColors: Record<string, string> = {
  created: "bg-green-50 border-green-200",
  updated: "bg-blue-50 border-blue-200",
  deleted: "bg-red-50 border-red-200",
  status_changed: "bg-purple-50 border-purple-200",
  participant_added: "bg-indigo-50 border-indigo-200",
  participant_removed: "bg-orange-50 border-orange-200",
  budget_updated: "bg-emerald-50 border-emerald-200",
  volunteer_updated: "bg-cyan-50 border-cyan-200",
};

export function ActivityLogsList() {
  const [activities, setActivities] = useState<ActivityType[]>(initialActivities);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ActivityStatus | "All">("All");
  const [filterAction, setFilterAction] = useState<FilterType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [isLogViewOpen, setIsLogViewOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [viewMode, setViewMode] = useState<"activities" | "logs">("activities");
  const [autoLog, setAutoLog] = useState(true);

  // New Activity Form State
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    Head_RO: "",
    participants: 0,
    status: "Pending" as ActivityStatus,
    category: "",
    budget: 0,
    volunteers: 0,
  });

  // Initialize logs
  useEffect(() => {
    if (autoLog) {
      setLogs(generateInitialLogs(activities));
    }
  }, [activities, autoLog]);

  // Auto-log function
  const addLog = (
    activityId: string,
    action: LogEntry["action"],
    description: string,
    user: string = "System",
    changes?: LogEntry["changes"],
    activityTitle?: string
  ) => {
    if (!autoLog) return;

    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      activityId,
      action,
      description,
      timestamp: new Date().toISOString(),
      user,
      changes,
      activityTitle: activityTitle || activities.find(a => a.id === activityId)?.title || "Unknown",
    };

    setLogs(prev => [newLog, ...prev]);
  };

  // CRUD Operations with auto-logging
  const handleCreateActivity = () => {
    if (!newActivity.title || !newActivity.date || !newActivity.location) {
      alert("Please fill in all required fields (Title, Date, and Location)");
      return;
    }

    const activity: ActivityType = {
      id: Date.now().toString(),
      title: newActivity.title,
      description: newActivity.description || "No description provided.",
      date: newActivity.date,
      location: newActivity.location,
      Head_RO: newActivity.Head_RO || "Unassigned",
      participants: newActivity.participants || 0,
      status: newActivity.status,
      createdAt: new Date().toISOString(),
      category: newActivity.category || "Uncategorized",
      budget: newActivity.budget || 0,
      volunteers: newActivity.volunteers || 0,
      createdBy: newActivity.Head_RO || "System",
      updatedAt: new Date().toISOString(),
    };

    setActivities([activity, ...activities]);
    
    // Auto-log creation
    addLog(
      activity.id,
      "created",
      `Activity "${activity.title}" was created by ${activity.createdBy}`,
      activity.createdBy,
      undefined,
      activity.title
    );

    setIsNewActivityModalOpen(false);
    setNewActivity({
      title: "",
      description: "",
      date: "",
      location: "",
      Head_RO: "",
      participants: 0,
      status: "Pending",
      category: "",
      budget: 0,
      volunteers: 0,
    });
  };

  const handleEditActivity = (id: string, updatedData: Partial<ActivityType>) => {
    const oldActivity = activities.find(a => a.id === id);
    if (!oldActivity) return;

    const changes: LogEntry["changes"] = [];
    let statusChanged = false;

    Object.keys(updatedData).forEach((key) => {
      const field = key as keyof ActivityType;
      if (oldActivity[field] !== updatedData[field]) {
        changes.push({
          field: field,
          from: oldActivity[field],
          to: updatedData[field],
        });
        if (field === "status") statusChanged = true;
      }
    });

    setActivities(
      activities.map((a) =>
        a.id === id ? { ...a, ...updatedData, updatedAt: new Date().toISOString() } : a
      )
    );

    // Auto-log update
    const action: LogEntry["action"] = statusChanged ? "status_changed" : "updated";
    const description = statusChanged
      ? `Status of "${oldActivity.title}" changed from ${oldActivity.status} to ${updatedData.status}`
      : `Activity "${oldActivity.title}" was updated`;
    
    addLog(
      id,
      action,
      description,
      "System",
      changes,
      oldActivity.title
    );

    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleDeleteActivity = (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    // Auto-log deletion before removing
    addLog(
      id,
      "deleted",
      `Activity "${activity.title}" was deleted`,
      "System",
      undefined,
      activity.title
    );

    setActivities(activities.filter((a) => a.id !== id));
    setIsDeleteModalOpen(false);
    setSelectedActivity(null);
  };

  const handleStatusChange = (id: string, newStatus: ActivityStatus) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const oldStatus = activity.status;
    
    setActivities(
      activities.map((a) =>
        a.id === id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a
      )
    );

    // Auto-log status change
    addLog(
      id,
      "status_changed",
      `Status of "${activity.title}" changed from ${oldStatus} to ${newStatus}`,
      "System",
      [{ field: "status", from: oldStatus, to: newStatus }],
      activity.title
    );
  };

  const handleParticipantUpdate = (id: string, newCount: number) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const oldCount = activity.participants;
    const action: LogEntry["action"] = newCount > oldCount ? "participant_added" : "participant_removed";
    
    setActivities(
      activities.map((a) =>
        a.id === id ? { ...a, participants: newCount, updatedAt: new Date().toISOString() } : a
      )
    );

    addLog(
      id,
      action,
      `Participants for "${activity.title}" ${newCount > oldCount ? 'increased' : 'decreased'} from ${oldCount} to ${newCount}`,
      "System",
      [{ field: "participants", from: oldCount, to: newCount }],
      activity.title
    );
  };

  // Filtering
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.description.toLowerCase().includes(search.toLowerCase()) ||
      activity.location.toLowerCase().includes(search.toLowerCase()) ||
      activity.Head_RO.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      (log.activityTitle && log.activityTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesAction = filterAction === "all" || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getStatusCount = (status: ActivityStatus | "All") => {
    if (status === "All") return activities.length;
    return activities.filter((a) => a.status === status).length;
  };

  const getActionCount = (action: FilterType) => {
    if (action === "all") return logs.length;
    return logs.filter((l) => l.action === action).length;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Environment: "bg-green-100 text-green-700",
      Education: "bg-blue-100 text-blue-700",
      Health: "bg-red-100 text-red-700",
      "Community Service": "bg-purple-100 text-purple-700",
      Recognition: "bg-yellow-100 text-yellow-700",
      Uncategorized: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.Uncategorized;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",
      status_changed: "Status Changed",
      participant_added: "Participant Added",
      participant_removed: "Participant Removed",
      budget_updated: "Budget Updated",
      volunteer_updated: "Volunteer Updated",
    };
    return labels[action] || action;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      full: date.toLocaleString(),
    };
  };

  const stats = {
    totalActivities: activities.length,
    totalLogs: logs.length,
    createdToday: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    statusChanges: logs.filter(l => l.action === "status_changed").length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track all activities and automatic logs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoLog(!autoLog)}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                autoLog 
                  ? "bg-green-100 text-green-700 border border-green-300" 
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              <Bell size={16} />
              {autoLog ? "Auto-Log: ON" : "Auto-Log: OFF"}
            </button>
            <button
              onClick={() => setViewMode(viewMode === "activities" ? "logs" : "activities")}
              className="flex items-center gap-2 text-sm font-medium text-white bg-[#E8622C] px-4 py-2 rounded-lg hover:bg-[#d45520] transition-colors shadow-sm"
            >
              {viewMode === "activities" ? <History size={18} /> : <Activity size={18} />}
              {viewMode === "activities" ? "View Logs" : "View Activities"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
          <p className="text-xs text-gray-500">Total Activities</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{stats.totalLogs}</p>
          <p className="text-xs text-gray-500">Total Log Entries</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.createdToday}</p>
          <p className="text-xs text-gray-500">Created Today</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{stats.statusChanges}</p>
          <p className="text-xs text-gray-500">Status Changes</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={viewMode === "activities" ? "Search activities..." : "Search logs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {viewMode === "activities" ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter size={16} />
                  Status
                  <ChevronDown size={14} />
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-10">
                    {["All", "Pending", "Submitted", "Under Review", "Approved", "In Progress", "Completed", "Rejected"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setFilterStatus(status as ActivityStatus | "All");
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            filterStatus === status ? "text-[#E8622C] font-medium bg-orange-50" : "text-gray-600"
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
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#E8622C] px-4 py-2.5 rounded-lg hover:bg-[#d45520] transition-colors"
              >
                <Plus size={16} />
                Create Activity
              </button>
            </>
          ) : (
            <>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as FilterType)}
                className="text-sm border border-gray-200 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 bg-white"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="status_changed">Status Changed</option>
              </select>
              <span className="text-sm text-gray-500">
                Showing {filteredLogs.length} of {logs.length} logs
              </span>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs for Activities */}
      {viewMode === "activities" && (
        <div className="flex flex-wrap gap-2 mb-4">
          {["All", "Pending", "Approved", "Under Review", "Completed"].map((status) => (
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
      )}

      {/* Main Content */}
      {viewMode === "activities" ? (
        // Activities Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{activity.title}</h3>
                    {activity.category && (
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${getCategoryColor(activity.category)}`}>
                        {activity.category}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[activity.status]}`}
                >
                  {statusIcons[activity.status]}
                  {activity.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{activity.description}</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span>{activity.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="truncate">{activity.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={12} className="text-gray-400" />
                  <span>YL: {activity.Head_RO}</span>
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
                <button
                  onClick={() => {
                    // Show logs for this activity
                    const activityLogs = logs.filter(l => l.activityId === activity.id);
                    if (activityLogs.length > 0) {
                      setSelectedLog(activityLogs[0]);
                      setIsLogViewOpen(true);
                    }
                  }}
                  className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <History size={14} />
                  Logs ({logs.filter(l => l.activityId === activity.id).length})
                </button>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search size={48} className="mx-auto" />
              </div>
              <p className="text-sm text-gray-400">No activities match your search.</p>
              <p className="text-xs text-gray-300 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      ) : (
        // Logs View
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`bg-white rounded-xl border ${actionColors[log.action] || 'border-gray-100'} shadow-sm p-4 hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {actionIcons[log.action] || <Info size={16} className="text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {log.description}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {getActionLabel(log.action)}
                    </span>
                    {log.changes && log.changes.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setIsLogViewOpen(true);
                        }}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        View details
                      </button>
                    )}
                  </div>
                  <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {log.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {formatTimestamp(log.timestamp).date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimestamp(log.timestamp).time}
                    </span>
                    {log.activityTitle && (
                      <span className="flex items-center gap-1 text-[#E8622C]">
                        <FileText size={12} />
                        {log.activityTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <History size={48} className="mx-auto" />
              </div>
              <p className="text-sm text-gray-400">No logs found.</p>
              <p className="text-xs text-gray-300 mt-1">Logs are automatically generated when activities are created, updated, or deleted.</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 px-5 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">
            {viewMode === "activities" ? "Total Activities:" : "Total Logs:"}
          </span>
          <span className="text-gray-900 font-semibold">
            {viewMode === "activities" ? filteredActivities.length : filteredLogs.length}
          </span>
          {viewMode === "activities" && filteredActivities.length !== activities.length && (
            <span className="text-xs text-gray-400">
              (Filtered from {activities.length} total)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Last updated: {new Date().toLocaleString()}</span>
          {autoLog && (
            <>
              <span className="w-px h-4 bg-gray-200" />
              <span className="text-green-600">Auto-logging active</span>
            </>
          )}
        </div>
      </div>

      {/* Modals - Same as before but with auto-log integration */}
      {/* New Activity Modal */}
      {isNewActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="Enter activity title"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="Enter activity description"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  placeholder="Enter activity location"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                >
                  <option value="">Select Category</option>
                  <option value="Environment">Environment</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Community Service">Community Service</option>
                  <option value="Recognition">Recognition</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Head of RO</label>
                <select
                  value={newActivity.Head_RO}
                  onChange={(e) => setNewActivity({ ...newActivity, Head_RO: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                >
                  <option value="">Select Head of RO</option>
                  <option value="Zainab Ali">Zainab Ali</option>
                  <option value="Ahmed Farooq">Ahmed Farooq</option>
                  <option value="Fatima Noor">Fatima Noor</option>
                  <option value="Ali Hassan">Ali Hassan</option>
                  <option value="Multiple">Multiple</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Participants</label>
                  <input
                    type="number"
                    value={newActivity.participants || ""}
                    onChange={(e) => setNewActivity({ ...newActivity, participants: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Volunteers</label>
                  <input
                    type="number"
                    value={newActivity.volunteers || ""}
                    onChange={(e) => setNewActivity({ ...newActivity, volunteers: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Budget (PKR)</label>
                <input
                  type="number"
                  value={newActivity.budget || ""}
                  onChange={(e) => setNewActivity({ ...newActivity, budget: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={newActivity.status}
                  onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value as ActivityStatus })}
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
                  setIsNewActivityModalOpen(false);
                  setNewActivity({
                    title: "",
                    description: "",
                    date: "",
                    location: "",
                    Head_RO: "",
                    participants: 0,
                    status: "Pending",
                    category: "",
                    budget: 0,
                    volunteers: 0,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
                  id="edit-title"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea
                  defaultValue={selectedActivity.description}
                  id="edit-description"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  defaultValue={selectedActivity.status}
                  id="edit-status"
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
                  const title = (document.getElementById('edit-title') as HTMLInputElement)?.value;
                  const description = (document.getElementById('edit-description') as HTMLTextAreaElement)?.value;
                  const status = (document.getElementById('edit-status') as HTMLSelectElement)?.value as ActivityStatus;
                  
                  if (selectedActivity) {
                    handleEditActivity(selectedActivity.id, { title, description, status });
                  }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedActivity.title}</h2>
                {selectedActivity.category && (
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${getCategoryColor(selectedActivity.category)}`}>
                    {selectedActivity.category}
                  </span>
                )}
              </div>
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
                <span>YL: {selectedActivity.Head_RO}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users size={14} />
                <span>{selectedActivity.participants} participants</span>
              </div>
              {selectedActivity.volunteers !== undefined && (
                <div className="flex items-center gap-2 text-gray-500">
                  <UserCheck size={14} />
                  <span>{selectedActivity.volunteers} volunteers</span>
                </div>
              )}
              {selectedActivity.budget !== undefined && (
                <div className="flex items-center gap-2 text-gray-500">
                  <DollarSign size={14} />
                  <span>PKR {selectedActivity.budget.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500">
                <span className="font-medium">Created:</span>
                <span>{new Date(selectedActivity.createdAt).toLocaleDateString()}</span>
              </div>
              {selectedActivity.updatedAt && (
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="font-medium">Last Updated:</span>
                  <span>{new Date(selectedActivity.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
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

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 text-center mb-2">Delete Activity</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{selectedActivity.title}"</span>? 
              This action cannot be undone.
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
                onClick={() => handleDeleteActivity(selectedActivity.id)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {isLogViewOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Log Details</h2>
                <span className="text-sm text-gray-500">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <button
                onClick={() => {
                  setIsLogViewOpen(false);
                  setSelectedLog(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {actionIcons[selectedLog.action] || <Info size={16} className="text-gray-500" />}
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${actionColors[selectedLog.action] || 'bg-gray-50'}`}>
                  {getActionLabel(selectedLog.action)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{selectedLog.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-medium">User:</span> {selectedLog.user}</p>
                {selectedLog.activityTitle && (
                  <p><span className="font-medium">Activity:</span> {selectedLog.activityTitle}</p>
                )}
                <p><span className="font-medium">Time:</span> {new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Changes</h4>
                  <div className="space-y-1">
                    {selectedLog.changes.map((change, index) => (
                      <div key={index} className="text-xs bg-gray-50 rounded-lg p-2">
                        <span className="font-medium text-gray-700">{change.field}:</span>
                        <span className="text-red-500 ml-2">from {change.from}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="text-green-500">to {change.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setIsLogViewOpen(false);
                setSelectedLog(null);
              }}
              className="w-full mt-6 px-4 py-2 text-sm font-medium text-white bg-[#E8622C] rounded-lg hover:bg-[#d45520] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}