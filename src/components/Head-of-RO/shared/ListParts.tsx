"use client";

import { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { statusStyles, type DisplayStatus } from "@/utils/user-status";

/** Consistent page title block used by every Head RO screen. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Shows the right empty-state copy: "nothing yet" when there's no data at all,
 * "no matches" only when a search/filter is narrowing the list.
 */
export function emptyMessage(options: { isFiltered: boolean; noun: string; emptyHint?: string }) {
  return options.isFiltered
    ? `No ${options.noun} match your search or filters.`
    : `No ${options.noun} yet.${options.emptyHint ? ` ${options.emptyHint}` : ""}`;
}

export function TableMessageRow({ colSpan, message, error = false }: { colSpan: number; message: string; error?: boolean }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        role={error ? "alert" : undefined}
        className={`px-6 py-10 text-center text-sm ${error ? "text-red-500" : "text-gray-400"}`}
      >
        {message}
      </td>
    </tr>
  );
}

/** Error from a row action (delete, complete, …) — shown above the list without hiding it. */
export function ActionErrorBanner({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss error" className="text-red-400 hover:text-red-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function LoadMoreButton({
  hasMore,
  isLoadingMore,
  onClick,
  shownCount,
}: {
  hasMore: boolean;
  isLoadingMore: boolean;
  onClick: () => void;
  shownCount: number;
}) {
  if (!hasMore && shownCount === 0) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
      <span>
        Showing {shownCount} {hasMore ? "loaded so far" : "total"}
      </span>
      {hasMore && (
        <button
          type="button"
          onClick={onClick}
          disabled={isLoadingMore}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        >
          {isLoadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

/** Pill-style single-select filter row (status, role, …). */
export function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600" role="group" aria-label={label}>
      <span className="font-medium">{label}:</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            value === option.value ? "bg-brand text-white" : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export const inputClass =
  "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-gray-50 disabled:text-gray-400";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs font-normal text-red-500">{message}</span>;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        // The browser's own clear button only exists in some browsers; use ours everywhere.
        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
