"use client";

import {
  Award,
  CheckCircle,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";

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

export function RecentActivity() {
  return (
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
  );
}