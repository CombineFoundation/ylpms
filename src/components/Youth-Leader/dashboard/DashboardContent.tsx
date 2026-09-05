"use client";

import {
  Users,
  ClipboardList,
  Calendar,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  User,
} from "lucide-react";

// Stat Cards Data
const statCards = [
  {
    label: "My Volunteers",
    value: "8",
    icon: Users,
    color: "bg-blue-100 text-blue-500",
  },
  {
    label: "Assigned Tasks",
    value: "5",
    icon: ClipboardList,
    color: "bg-orange-100 text-orange-500",
  },
  {
    label: "Activities",
    value: "3",
    icon: Calendar,
    color: "bg-emerald-100 text-emerald-500",
  },
  {
    label: "Certificates Earned",
    value: "4",
    icon: Award,
    color: "bg-purple-100 text-purple-500",
  },
];

// Recent Activity Data
const recentActivities = [
  {
    id: 1,
    text: "Certificate Issued to Zainab Ali for Community Outreach Drive",
    time: "2h ago",
    icon: <Award size={14} className="text-emerald-500" />,
  },
  {
    id: 2,
    text: 'Activity "Youth Tech Workshop" approved by Head RO',
    time: "4h ago",
    icon: <CheckCircle size={14} className="text-emerald-500" />,
  },
  {
    id: 3,
    text: "Report submitted by Sara Malik for August branch review",
    time: "5h ago",
    icon: <Clock size={14} className="text-amber-500" />,
  },
  {
    id: 4,
    text: "New volunteer Usman Raza added by Youth Leader Zainab Ali",
    time: "1d ago",
    icon: <User size={14} className="text-blue-500" />,
  },
  {
    id: 5,
    text: 'Training video "Leadership Skills 101" uploaded by Head RO',
    time: "1d ago",
    icon: <Clock size={14} className="text-amber-500" />,
  },
  {
    id: 6,
    text: 'Task "Quarterly Review" marked overdue — Bilal Hussain',
    time: "2d ago",
    icon: <AlertCircle size={14} className="text-red-500" />,
  },
];

// Upcoming Activities Data
const upcomingActivities = [
  {
    id: 1,
    title: "Community Clean-Up Drive",
    date: "Aug 18, 2025",
    location: "Cushion Park, Karachi",
    participants: 34,
    status: "Approved",
    statusColor: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 2,
    title: "Youth Leadership Workshop",
    date: "Aug 22, 2025",
    location: "Foundation HQ",
    participants: 20,
    status: "Pending",
    statusColor: "bg-amber-100 text-amber-600",
  },
  {
    id: 3,
    title: "Volunteer Appreciation Day",
    date: "Aug 30, 2025",
    location: "City Hall",
    participants: 85,
    status: "Approved",
    statusColor: "bg-emerald-100 text-emerald-600",
  },
];

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, Zainab 🌟
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your volunteers and activities
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity and Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
          </div>
          <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="mt-0.5 flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700">Upcoming Activities</h2>
          </div>
          <div className="p-5 space-y-4">
            {upcomingActivities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {activity.title}
                  </h3>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${activity.statusColor}`}
                  >
                    {activity.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} className="text-gray-400" />
                    <span>{activity.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} className="text-gray-400" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users size={12} className="text-gray-400" />
                    <span>{activity.participants} participants</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Zainab Ali</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">Youth Leader</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Last updated: Today</span>
        </div>
      </div>
    </div>
  );
}