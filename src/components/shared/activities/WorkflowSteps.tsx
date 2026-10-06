import { Check } from "lucide-react";
import type { ActivityStatus } from "@/types/activity.types";
import { WORKFLOW_STEPS, completedSteps } from "./activity.types";

/**
 * The activity workflow as a row of steps. With a `status`, steps already done
 * are ticked and the next one is highlighted; without one it's a legend.
 */
export function WorkflowSteps({ status, compact = false }: { status?: ActivityStatus; compact?: boolean }) {
  const done = status ? completedSteps(status) : 0;
  const rejected = status === "rejected";

  return (
    <ol
      className={`flex flex-wrap items-center gap-y-2 ${compact ? "gap-x-1 text-[10px]" : "gap-x-2 text-xs"}`}
      aria-label={status ? `Workflow progress: ${done} of ${WORKFLOW_STEPS.length} steps done` : "Activity workflow"}
    >
      {WORKFLOW_STEPS.map((step, index) => {
        const isDone = !!status && index < done;
        const isCurrent = !!status && index === done;
        const circle = isDone
          ? "bg-emerald-500 text-white"
          : isCurrent
            ? rejected
              ? "bg-red-500 text-white"
              : "bg-brand text-white"
            : status
              ? "bg-gray-100 text-gray-400"
              : "bg-brand text-white";
        return (
          <li key={step} className="flex items-center">
            <span
              className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${circle} ${
                compact ? "h-5 w-5" : "h-7 w-7"
              }`}
              aria-hidden="true"
            >
              {isDone ? <Check className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} /> : index + 1}
            </span>
            <span
              className={`ml-1.5 ${
                isCurrent ? "font-semibold text-gray-800" : isDone || !status ? "text-gray-600" : "text-gray-400"
              } ${compact && !isCurrent ? "hidden sm:inline" : ""}`}
            >
              {step}
            </span>
            {index < WORKFLOW_STEPS.length - 1 && <span className={`mx-1.5 text-gray-300 ${compact ? "mx-1" : ""}`}>›</span>}
          </li>
        );
      })}
    </ol>
  );
}
