"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Plus, Pencil, Trash2 } from "lucide-react";

type Status = "Active" | "Inactive" | "Pending";

type Sro = {
  id: string;
  name: string;
  region: string;
  rosUnder: number;
  status: Status;
  joined: string;
};

const initialSros: Sro[] = [
  {
    id: "1",
    name: "Maria Santos",
    region: "NCR",
    rosUnder: 12,
    status: "Active",
    joined: "Jan 2023",
  },
  {
    id: "2",
    name: "Jose Reyes",
    region: "Region III",
    rosUnder: 9,
    status: "Active",
    joined: "Mar 2023",
  },
  {
    id: "3",
    name: "Ana Cruz",
    region: "Region IV-A",
    rosUnder: 15,
    status: "Inactive",
    joined: "Jun 2022",
  },
  {
    id: "4",
    name: "Carlos Dela Cruz",
    region: "Region VII",
    rosUnder: 7,
    status: "Active",
    joined: "Aug 2023",
  },
  {
    id: "5",
    name: "Liza Ramos",
    region: "Region XI",
    rosUnder: 11,
    status: "Pending",
    joined: "Oct 2023",
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

export function SroList() {
  const [sros] = useState<Sro[]>(initialSros);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sros;
    return sros.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
    );
  }, [sros, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Senior Regional Officers
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and assign SROs across all regions.
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
                <th className="px-6 py-3.5">Region</th>
                <th className="px-6 py-3.5">ROs Under</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((sro) => (
                <tr key={sro.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8622C] text-xs font-bold text-white">
                        {initials(sro.name)}
                      </div>
                      <span className="font-medium text-gray-900">
                        {sro.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#E8622C] font-medium">
                    {sro.region}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {sro.rosUnder}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[sro.status]}`}
                    >
                      {sro.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {sro.joined}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="rounded-full bg-[#E8622C] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#d9551f] transition-colors whitespace-nowrap"
                      >
                        Assign RO
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${sro.name}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${sro.name}`}
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
                    No SROs match your search.
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