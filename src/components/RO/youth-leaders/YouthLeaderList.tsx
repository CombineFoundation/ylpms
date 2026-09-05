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
  User,
  Calendar,
  MapPin,
} from "lucide-react";

type Status = "Active" | "Inactive" | "Pending";

type YouthLeader = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  age: number;
  barangay: string;
  volunteersUnder: number;
  status: Status;
};

const initialYouthLeaders: YouthLeader[] = [
  {
    id: "1",
    name: "Sitti Amina",
    initials: "SA",
    avatarColor: "bg-pink-500",
    age: 21,
    barangay: "Calios",
    volunteersUnder: 12,
    status: "Active",
  },
  {
    id: "2",
    name: "John Mark Rayas",
    initials: "JMR",
    avatarColor: "bg-blue-500",
    age: 22,
    barangay: "Bagumbayan",
    volunteersUnder: 15,
    status: "Active",
  },
  {
    id: "3",
    name: "Maria Clara",
    initials: "MC",
    avatarColor: "bg-purple-500",
    age: 20,
    barangay: "Pagsowitan",
    volunteersUnder: 8,
    status: "Inactive",
  },
  {
    id: "4",
    name: "Dave Bautista",
    initials: "DB",
    avatarColor: "bg-emerald-500",
    age: 23,
    barangay: "San Jose",
    volunteersUnder: 10,
    status: "Active",
  },
  {
    id: "5",
    name: "Juan Miguel",
    initials: "JM",
    avatarColor: "bg-orange-500",
    age: 22,
    barangay: "Bubukal",
    volunteersUnder: 0,
    status: "Pending",
  },
];

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-100 text-emerald-600",
  Inactive: "bg-gray-100 text-gray-400",
  Pending: "bg-amber-100 text-amber-600",
};

export function YouthLeaderList() {
  const [youthLeaders] = useState<YouthLeader[]>(initialYouthLeaders);
  const [search, setSearch] = useState("");

  const filtered = youthLeaders.filter(
    (leader) =>
      leader.name.toLowerCase().includes(search.toLowerCase()) ||
      leader.barangay.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Youth Leaders</h1>
        <p className="text-sm text-gray-500">
          Manage youth leaders in your region.
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
              placeholder="Search Youth Leaders..."
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
                  Age
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Barangay
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                  Volunteers Under
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
              {filtered.map((leader) => (
                <tr key={leader.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${leader.avatarColor}`}
                      >
                        {leader.initials}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {leader.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {leader.age}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {leader.barangay}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {leader.volunteersUnder} members
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[leader.status]}`}
                    >
                      {leader.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`View ${leader.name}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${leader.name}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${leader.name}`}
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
                    No youth leaders match your search.
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
            <span className="font-medium">Total Youth Leaders:</span>
            <span className="text-gray-900 font-semibold">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              <Plus size={15} />
              Add Youth Leader
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