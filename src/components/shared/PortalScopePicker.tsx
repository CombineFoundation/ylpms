"use client";

import { Eye } from "lucide-react";
import { usePortalScope, type ScopedRole } from "@/hooks/usePortalScope";

/**
 * Developer-only bar for choosing whose portal to view (an SRO, RO, youth leader or volunteer).
 * Renders nothing for everyone else.
 */
export function PortalScopePicker({ role, className = "" }: { role: ScopedRole; className?: string }) {
  const { isDeveloper, roleName, options, selectedId, select, error } = usePortalScope(role);
  if (!isDeveloper) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 border-orange-100 bg-orange-50 text-sm text-orange-800 ${className}`}>
      <Eye className="h-4 w-4 shrink-0" />
      <span className="font-medium">Developer view</span>
      {error ? (
        <span className="text-brand-dark">{error}</span>
      ) : (
        <label className="flex items-center gap-2">
          <span>Acting as {roleName}:</span>
          <select
            value={selectedId ?? ""}
            onChange={(event) => select(event.target.value)}
            disabled={options.length === 0}
            className="rounded-md border border-orange-200 bg-white px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {options.length === 0 && <option value="">Loading…</option>}
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
                {option.region ? ` · ${option.region}` : ""}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
