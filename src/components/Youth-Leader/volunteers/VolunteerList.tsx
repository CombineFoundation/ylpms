"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  Users,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
} from "lucide-react";

type Volunteer = {
  id: string;
  name: string;
  email: string;
  branch: string;
  supervisor: string;
  joined: string;
  status: "Active" | "Inactive";
  tasks: number;
};

const initialVolunteers: Volunteer[] = [
  {
    id: "1",
    name: "Usman Raza",
    email: "usman.raza@ypl.org",
    branch: "Lahore East",
    supervisor: "Zainab Ali",
    joined: "Aug 10, 2025",
    status: "Active",
    tasks: 4,
  },
  {
    id: "2",
    name: "Sana Tariq",
    email: "sana.tariq@ypl.org",
    branch: "Lahore East",
    supervisor: "Zainab Ali",
    joined: "Aug 1, 2025",
    status: "Active",
    tasks: 3,
  },
  {
    id: "3",
    name: "Omar Sheikh",
    email: "omar.sheikh@ypl.org",
    branch: "Lahore West",
    supervisor: "Ahmed Farooq",
    joined: "Jul 15, 2025",
    status: "Active",
    tasks: 2,
  },
  {
    id: "4",
    name: "Maria Javed",
    email: "maria.javed@ypl.org",
    branch: "Karachi North",
    supervisor: "Fatima Noor",
    joined: "Jul 25, 2025",
    status: "Active",
    tasks: 5,
  },
  {
    id: "5",
    name: "Faisal Mahmood",
    email: "faisal.mahmood@ypl.org",
    branch: "Karachi South",
    supervisor: "Ali Hassan",
    joined: "Jun 30, 2025",
    status: "Active",
    tasks: 0,
  },
];

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-600",
  Inactive: "bg-gray-100 text-gray-400",
};

export function VolunteerList() {
  const [volunteers] = useState<Volunteer[]>(initialVolunteers);
  const [search, setSearch] = useState("");

  const filtered = volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(search.toLowerCase()) ||
      volunteer.branch.toLowerCase().includes(search.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Volunteers</h1>
            <p className="text-sm text-gray-500">
              {filtered.length} members
            </p>
          </div>
          <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#E8622C] px-4 py-2 rounded-lg hover:bg-[#d45520] transition-colors">
            <Users size={15} />
            Add Volunteer
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search name or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Member
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Branch
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Supervisor
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Joined
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Tasks
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
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {volunteer.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">{volunteer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      {volunteer.branch}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {volunteer.supervisor}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{volunteer.joined}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[volunteer.status]}`}
                    >
                      {volunteer.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {volunteer.tasks} active
                      </span>
                    </div>
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
                    colSpan={7}
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
            <span className="font-medium">Total Volunteers:</span>
            <span className="text-gray-900 font-semibold">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>1-{filtered.length} of {filtered.length}</span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}