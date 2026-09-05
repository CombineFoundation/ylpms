"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

type Status = "Active" | "Inactive" | "Pending";

type Volunteer = {
  id: string;
  name: string;
  ro: string;
  skills: string;
  hours: number;
  status: Status;
};

const initialVolunteers: Volunteer[] = [
  {
    id: "1",
    name: "Amelia Flores",
    ro: "Pedro Manalo",
    skills: "Medical",
    hours: 120,
    status: "Active",
  },
  {
    id: "2",
    name: "Bernard King",
    ro: "Rosa Bautista",
    skills: "Teaching",
    hours: 98,
    status: "Active",
  },
  {
    id: "3",
    name: "Cynthia Park",
    ro: "Gloria Mendoza",
    skills: "Engineering",
    hours: 74,
    status: "Inactive",
  },
  {
    id: "4",
    name: "Diego Navarro",
    ro: "Ramon Aquino",
    skills: "Logistics",
    hours: 55,
    status: "Active",
  },
  {
    id: "5",
    name: "Ella Reyes",
    ro: "Elena Pascual",
    skills: "IT",
    hours: 142,
    status: "Active",
  },
];

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-100 text-emerald-600",
  Inactive: "bg-gray-100 text-gray-400",
  Pending: "bg-amber-100 text-amber-600",
};

export default function VolunteersContent() {
  const [volunteers] = useState<Volunteer[]>(initialVolunteers);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return volunteers;
    return volunteers.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.ro.toLowerCase().includes(q) ||
        v.skills.toLowerCase().includes(q) ||
        v.status.toLowerCase().includes(q)
    );
  }, [volunteers, query]);

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
            <p className="text-sm text-gray-500 mt-1">
              All registered volunteers across regions.
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8622C]/30 focus:border-[#E8622C]"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-[#E8622C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d9551f] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">RO</th>
                    <th className="px-6 py-3.5">Skills</th>
                    <th className="px-6 py-3.5">Hours</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {v.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{v.ro}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {v.skills}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {v.hours}h
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[v.status]}`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label={`View ${v.name}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${v.name}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${v.name}`}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
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
          </div>
        </main>
      </div>
    </div>
  );
}