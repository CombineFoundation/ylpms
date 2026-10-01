import { Plus } from "lucide-react";
import { FilterPills, SearchInput } from "../shared/ListParts";
import { TASK_STATUS_FILTERS, type TaskStatusFilter } from "./task-display.types";

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatusFilter;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  onAdd: () => void;
}

export function TaskToolbar({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange, onAdd }: TaskToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Search tasks by title, assignee or priority..." />
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>
      <FilterPills label="Status" options={TASK_STATUS_FILTERS} value={statusFilter} onChange={onStatusFilterChange} />
    </div>
  );
}
