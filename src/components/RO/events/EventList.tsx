"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Users,
  Eye,
  Pencil,
  ChevronRight,
} from "lucide-react";

type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  status: "Upcoming" | "Past";
};

const initialEvents: Event[] = [
  {
    id: "1",
    title: "National Volunteer Summit",
    date: "Aug 25, 2026",
    location: "Manila",
    attendees: 340,
    status: "Upcoming",
  },
  {
    id: "2",
    title: "Region IV Community Outreach",
    date: "Sep 18, 2026",
    location: "Calamba",
    attendees: 120,
    status: "Upcoming",
  },
  {
    id: "3",
    title: "Youth Leadership Workshop",
    date: "Sep 02, 2026",
    location: "Sia Cruz",
    attendees: 80,
    status: "Upcoming",
  },
  {
    id: "4",
    title: "Disaster Preparedness Drill",
    date: "Sep 12, 2026",
    location: "San Pablo",
    attendees: 200,
    status: "Upcoming",
  },
];

const statusColors: Record<string, string> = {
  Upcoming: "bg-emerald-100 text-emerald-600",
  Past: "bg-gray-100 text-gray-400",
};

export function EventList() {
  const [events] = useState<Event[]>(initialEvents);
  const [search, setSearch] = useState("");

  const filtered = events.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Events</h1>
        <p className="text-sm text-gray-500">
          Upcoming and past events in your region.
        </p>
      </div>

      {/* Search + Create bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
          />
        </div>
        <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
          <Plus size={15} />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            {/* Title */}
            <h2 className="text-base font-bold text-gray-800 mb-2">
              {event.title}
            </h2>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span>{event.date}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1.5">
              <MapPin size={14} className="text-gray-400" />
              <span>{event.location}</span>
            </div>

            {/* Attendees */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Users size={14} className="text-gray-400" />
              <span>{event.attendees} attendees registered</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye size={14} />
                View Details
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-orange-500 px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors">
                <Pencil size={14} />
                Edit
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-10 text-sm text-gray-400">
            No events match your search.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 px-5 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Total Events:</span>
          <span className="text-gray-900 font-semibold">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Showing {filtered.length} events</span>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}