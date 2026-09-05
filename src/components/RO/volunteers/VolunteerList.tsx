"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  Users,
} from "lucide-react";

type Status = "Active" | "Inactive";

type Volunteer = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  youthLeader: string;
  skills: string;
  hoursRendered: string;
  status: Status;
};

const initialVolunteers: Volunteer[] = [
  {
    id: "1",
    name: "Jose Rizal",
    initials: "JR",
    avatarColor: "bg-blue-500",
    youthLeader: "Sitti Amina",
    skills: "First Aid, Logistics",
    hoursRendered: "48 hrs",
    status: "Active",
  },
  {
    id: "2",
    name: "Andres Bonifacio",
    initials: "AB",
    avatarColor: "bg-red-500",
    youthLeader: "John Mark Rayas",
    skills: "Crowd Control, Drills",
    hoursRendered: "36 hrs",
    status: "Active",
  },
  {
    id: "3",
    name: "Emilio Aguinaldo",
    initials: "EA",
    avatarColor: "bg-yellow-600",
    youthLeader: "Maria Clara",
    skills: "Documentation",
    hoursRendered: "12 hrs",
    status: "Inactive",
  },
  {
    id: "4",
    name: "Apolinario Mabini",
    initials: "AM",
    avatarColor: "bg-purple-500",
    youthLeader: "Dave Bautista",
    skills: "IT & Communications",
    hoursRendered: "54 hrs",
    status: "Active",
  },
  {
    id: "5",
    name: "Melchora Aquino",
    initials: "MA",
    avatarColor: "bg-pink-500",
    youthLeader: "Sitti Amina",
    skills: "Medical Support",
    hoursRendered: "20 hrs",
    status: "Active",
  },
];

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-100 text-emerald-600",
  Inactive: "bg-gray-100 text-gray-400",
};

export function VolunteerList() {
  const [volunteers] = useState<Volunteer[]>(initialVolunteers);
  const [search, setSearch] = useState("");

  const filtered = volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(search.toLowerCase()) ||
      volunteer.youthLeader.toLowerCase().includes(search.toLowerCase()) ||
      volunteer.skills.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Volunteers</h1>
        <p className="text-sm text-gray-500">
          All registered volunteers in your area.
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search + Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Volunteers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={15} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Youth Leader
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Skills
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Hours Rendered
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
              {filtered.map((volunteer) => (
                <tr key={volunteer.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${volunteer.avatarColor}`}
                      >
                        {volunteer.initials}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {volunteer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {volunteer.youthLeader}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {volunteer.skills}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {volunteer.hoursRendered}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[volunteer.status]}`}
                    >
                      {volunteer.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`View ${volunteer.name}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${volunteer.name}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${volunteer.name}`}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    No volunteers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} className="text-gray-400" />
            <span className="font-medium">Total Volunteers:</span>
            <span className="text-gray-900 font-semibold">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              <Plus size={15} />
              Add Volunteer
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>1-{filtered.length} of {filtered.length}</span>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}