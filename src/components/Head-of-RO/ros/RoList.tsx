"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Plus, Eye, Pencil, Trash2 } from "lucide-react";

type Status = "Active" | "Inactive" | "Pending";

type Ro = {
  id: string;
  name: string;
  sro: string;
  region: string;
  volunteers: number;
  status: Status;
};

const initialRos: Ro[] = [
  {
    id: "1",
    name: "Pedro Manalo",
    sro: "Maria Santos",
    region: "NCR",
    volunteers: 34,
    status: "Active",
  },
  {
    id: "2",
    name: "Rosa Bautista",
    sro: "Maria Santos",
    region: "NCR",
    volunteers: 28,
    status: "Active",
  },
  {
    id: "3",
    name: "Felipe Torres",
    sro: "Jose Reyes",
    region: "Region III",
    volunteers: 19,
    status: "Inactive",
  },
  {
    id: "4",
    name: "Gloria Mendoza",
    sro: "Ana Cruz",
    region: "Region IV-A",
    volunteers: 41,
    status: "Active",
  },
  {
    id: "5",
    name: "Ramon Aquino",
    sro: "Carlos Dela Cruz",
    region: "Region VII",
    volunteers: 22,
    status: "Active",
  },
  {
    id: "6",
    name: "Elena Pascual",
    sro: "Liza Ramos",
    region: "Region XI",
    volunteers: 16,
    status: "Pending",
  },
];

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-100 text-emerald-600",
  Inactive: "bg-gray-100 text-gray-400",
  Pending: "bg-amber-100 text-amber-600",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function RoList() {
  const [ros] = useState<Ro[]>(initialRos);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ros;
    return ros.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.sro.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [ros, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Reporting Officer
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage all Regional Officers.
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
                <th className="px-6 py-3.5">SRO</th>
                <th className="px-6 py-3.5">Region</th>
                <th className="px-6 py-3.5">Volunteers</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((ro) => (
                <tr key={ro.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E3A6E] text-xs font-bold text-white">
                        {initials(ro.name)}
                      </div>
                      <span className="font-medium text-gray-900">
                        {ro.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#E8622C] font-medium">
                    {ro.sro}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {ro.region}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {ro.volunteers}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[ro.status]}`}
                    >
                      {ro.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`View ${ro.name}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${ro.name}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${ro.name}`}
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
                    No Reporting Officers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}