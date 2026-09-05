"use client";

import { Plus, MapPin, Calendar, Users } from "lucide-react";

const tagColors: Record<string, string> = {
  Summit: "bg-orange-100 text-orange-600",
  Outreach: "bg-orange-100 text-orange-600",
  Training: "bg-orange-100 text-orange-600",
  Drill: "bg-orange-100 text-orange-600",
};

const events = [
  {
    id: 1,
    title: "National Volunteer Summit",
    type: "Summit",
    date: "Aug 25, 2026",
    location: "Manila",
    attendees: 340,
  },
  {
    id: 2,
    title: "Region III Community Outreach",
    type: "Outreach",
    date: "Aug 18, 2026",
    location: "Pampanga",
    attendees: 120,
  },
  {
    id: 3,
    title: "Youth Leadership Workshop",
    type: "Training",
    date: "Sep 2, 2026",
    location: "Makati",
    attendees: 80,
  },
  {
    id: 4,
    title: "Disaster Preparedness Drill",
    type: "Drill",
    date: "Sep 12, 2026",
    location: "Cebu",
    attendees: 200,
  },
];

export function EventList() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Events</h1>
          <p className="text-sm text-gray-500">
            Upcoming and past events across{" "}
            <span className="text-orange-500">all regions</span>.
          </p>
        </div>
        <button className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          <Plus size={15} />
          Create Event
        </button>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            {/* Title + tag */}
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-800 leading-tight">
                {event.title}
              </h2>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-3 flex-shrink-0 ${
                  tagColors[event.type]
                }`}
              >
                {event.type}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{event.type}</p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {event.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {event.location}
              </span>
              <span className="flex items-center gap-1">
                <Users size={11} />
                {event.attendees}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-gray-600 border border-gray-200 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                View
              </button>
              <button className="text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-md transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}