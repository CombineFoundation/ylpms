"use client";

import {
  Calendar,
  MapPin,
  Users,
} from "lucide-react";

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

export function UpcomingActivities() {
  return (
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
  );
}