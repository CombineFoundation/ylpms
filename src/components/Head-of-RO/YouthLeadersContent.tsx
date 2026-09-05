"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

type Status = "Active" | "Inactive" | "Pending";

type YouthLeader = {
  id: string;
  name: string;
  ro: string;
  age: number;
  region: string;
  status: Status;
};

const initialLeaders: YouthLeader[] = [
  {
    id: "1",
    name: "Kevin Tan",
    ro: "Pedro Manalo",
    age: 24,
    region: "NCR",
    status: "Active",
  },
  {
    id: "2",
    name: "Sheila Go",
    ro: "Rosa Bautista",
    age: 22,
    region: "NCR",
    status: "Active",
  },
  {
    id: "3",
    name: "Marc Villanueva",
    ro: "Felipe Torres",
    age: 27,
    region: "Region III",
    status: "Inactive",
  },
  {
    id: "4",
    name: "Trisha Lopez",
    ro: "Gloria Mendoza",
    age: 21,
    region: "Region IV-A",
    status: "Active",
  },
];

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-100 text-emerald-600",
  Inactive: "bg-gray-100 text-gray-400",
  Pending: "bg-amber-100 text-amber-600",
};

export default function YouthLeadersContent() {
  const [leaders] = useState<YouthLeader[]>(initialLeaders);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leaders;
    return leaders.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.ro.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q)
    );
  }, [leaders, query]);

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Youth Leaders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage registered youth leaders under each RO.
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
                    <th className="px-6 py-3.5">Age</th>
                    <th className="px-6 py-3.5">Region</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((leader) => (
                    <tr key={leader.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {leader.name}
                      </td>
                      <td className="px-6 py-4 text-[#E8622C] font-medium">
                        {leader.ro}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {leader.age}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {leader.region}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[leader.status]}`}
                        >
                          {leader.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label={`View ${leader.name}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${leader.name}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${leader.name}`}
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
                        No youth leaders match your search.
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