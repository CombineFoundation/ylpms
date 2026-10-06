import { ChevronRight } from "lucide-react";
import { ROLE_LABELS, type PerformanceNode } from "./analytics.types";

const AVATAR_COLORS = ["bg-red-400", "bg-orange-400", "bg-blue-500", "bg-emerald-500", "bg-brand", "bg-purple-500"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "?";
}

function avatarColor(id: string) {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function performanceColor(value: number) {
  if (value >= 80) return "#16a34a";
  if (value >= 60) return "#eab308";
  if (value >= 40) return "#f97316";
  return "#ef4444";
}

type PerformanceRowProps = {
  node: PerformanceNode;
  onOpen?: () => void;
};

export function PerformanceRow({ node, onOpen }: PerformanceRowProps) {
  const isVolunteer = node.role === "volunteer";
  const tasks = isVolunteer ? node.ownTasks : node.teamTasks;
  const activities = node.teamActivities;
  const hasTeam = node.childIds.length > 0;

  const details = [
    !isVolunteer && `${node.teamSize} team member${node.teamSize === 1 ? "" : "s"}`,
    `${tasks.assigned} task${tasks.assigned === 1 ? "" : "s"} assigned`,
    `${tasks.completed} completed`,
    tasks.inProgress > 0 && `${tasks.inProgress} in progress`,
    tasks.overdue > 0 && `${tasks.overdue} overdue`,
    isVolunteer
      ? `${activities.completed} activit${activities.completed === 1 ? "y" : "ies"} attended`
      : `${activities.completed} of ${activities.counted} activit${activities.counted === 1 ? "y" : "ies"} completed`,
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColor(node.id)}`}
      >
        {initials(node.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-medium text-gray-700">
            {node.name}
            {node.region && <span className="ml-1.5 font-normal text-gray-400">· {node.region}</span>}
          </span>
          <span className="shrink-0 font-semibold text-gray-600">
            {node.performance === null ? "—" : `${node.performance}%`}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          {node.performance !== null && (
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${node.performance}%`, backgroundColor: performanceColor(node.performance) }}
            />
          )}
        </div>
        <p className="mt-1 truncate text-[11px] text-gray-400">
          {details.join(" · ")}
        </p>
      </div>

      {!isVolunteer && (
        <button
          type="button"
          onClick={onOpen}
          disabled={!hasTeam}
          aria-label={hasTeam ? `View team under ${node.name}` : `No one reports to ${node.name}`}
          title={hasTeam ? `View ${ROLE_LABELS[node.role].singular} team` : "No team members assigned"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
