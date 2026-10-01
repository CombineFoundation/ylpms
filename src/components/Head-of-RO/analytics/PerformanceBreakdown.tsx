"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { PerformanceRow } from "./PerformanceRow";
import { ROLE_LABELS, type PerformanceNode, type PerformanceTree } from "./analytics.types";

/** Heading for a list of rows, e.g. "Youth Leaders" or "Team members" when roles are mixed. */
function listTitle(rows: PerformanceNode[]) {
  const roles = new Set(rows.map((row) => row.role));
  if (roles.size === 1) return ROLE_LABELS[rows[0].role].plural;
  return "Team members";
}

export function PerformanceBreakdown() {
  const [tree, setTree] = useState<PerformanceTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Ids drilled into, from the SRO down to the current level. */
  const [path, setPath] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiFetch<PerformanceTree>("/api/analytics/performance")
      .then((data) => !cancelled && setTree(data))
      .catch((error) => !cancelled && setLoadError(errorMessage(error, "Unable to load performance.")))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const current = tree && path.length > 0 ? tree.nodes[path[path.length - 1]] : null;
  const rowIds = tree ? (current ? current.childIds : tree.rootIds) : [];
  const rows = tree ? rowIds.map((id) => tree.nodes[id]).filter(Boolean) : [];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            {current ? `${listTitle(rows)} under ${current.name}` : "SRO Performance"}
          </h2>
          <p className="text-xs text-gray-400">
            Overall, from all tasks assigned so far — use <ChevronRight size={11} className="inline" /> to see each
            team.
          </p>
        </div>
        {current && (
          <button
            type="button"
            onClick={() => setPath(path.slice(0, -1))}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={12} />
            Back
          </button>
        )}
      </div>

      {tree && path.length > 0 && (
        <nav aria-label="Performance breadcrumb" className="mt-3 flex flex-wrap items-center gap-1 text-xs">
          <button type="button" onClick={() => setPath([])} className="text-brand hover:underline">
            All SROs
          </button>
          {path.map((id, index) => {
            const node = tree.nodes[id];
            const isLast = index === path.length - 1;
            return (
              <span key={id} className="flex items-center gap-1">
                <ChevronRight size={11} className="text-gray-300" />
                {isLast ? (
                  <span className="font-medium text-gray-700">
                    {node.name} <span className="font-normal text-gray-400">({ROLE_LABELS[node.role].singular})</span>
                  </span>
                ) : (
                  <button type="button" onClick={() => setPath(path.slice(0, index + 1))} className="text-brand hover:underline">
                    {node.name}
                  </button>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {current && (
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-center sm:grid-cols-4">
          {[
            { label: "Performance", value: current.performance === null ? "—" : `${current.performance}%` },
            { label: "Tasks assigned", value: current.teamTasks.assigned },
            { label: "Completed", value: current.teamTasks.completed },
            { label: "Overdue", value: current.teamTasks.overdue },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-base font-bold text-gray-800">{stat.value}</p>
              <p className="text-[11px] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 divide-y divide-gray-100">
        {isLoading && <p className="py-4 text-sm text-gray-400">Loading performance...</p>}
        {!isLoading && loadError && (
          <p role="alert" className="py-4 text-sm text-red-500">
            {loadError}
          </p>
        )}
        {!isLoading && !loadError && rows.length === 0 && (
          <p className="py-4 text-xs text-gray-400">{current ? "No one reports to this user yet." : "No SROs yet."}</p>
        )}
        {rows.map((node) => (
          <PerformanceRow key={node.id} node={node} onOpen={() => setPath([...path, node.id])} />
        ))}
      </div>

      {!isLoading && !loadError && tree && tree.unassignedCount > 0 && (
        <div className="mt-3 flex items-start gap-1.5 border-t border-gray-100 pt-3 text-[11px] text-gray-400">
          <Info size={12} className="mt-px shrink-0" />
          <p>
            {tree.unassignedCount} user{tree.unassignedCount === 1 ? " isn't" : "s aren't"} under any SRO yet and{" "}
            {tree.unassignedCount === 1 ? "is" : "are"} not shown.
          </p>
        </div>
      )}
    </div>
  );
}
