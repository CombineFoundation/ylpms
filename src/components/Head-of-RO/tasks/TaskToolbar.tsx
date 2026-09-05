import { Search, Filter, Plus } from "lucide-react";

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function TaskToolbar({ searchQuery, onSearchChange }: TaskToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
  );
}