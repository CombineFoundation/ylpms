import type { ReactNode } from "react";
import {
  Ban,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  LogIn,
  LogOut,
  MapPin,
  Pencil,
  Play,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Undo2,
  Upload,
  Users,
} from "lucide-react";
import { nameWithRole } from "@/components/shared/MemberProfileCard";
import { WorkflowSteps } from "./WorkflowSteps";
import {
  formatActivityRange,
  statusLabels,
  statusStyles,
  typeLabels,
  typeStyles,
  usesWorkflow,
  type ApiActivity,
} from "./activity.types";

export type ActivityAction =
  | "view"
  | "edit"
  | "delete"
  | "submit"
  | "withdraw"
  | "approve"
  | "reject"
  | "start"
  | "evidence"
  | "verify"
  | "return"
  | "cancel"
  | "join"
  | "leave";

type ActivityCardProps = {
  activity: ApiActivity;
  isBusy: boolean;
  onAction: (action: ActivityAction, activity: ApiActivity) => void;
};

function ActionButton({
  onClick,
  disabled,
  icon,
  children,
  tone = "default",
}: {
  onClick: () => void;
  disabled: boolean;
  icon: ReactNode;
  children: ReactNode;
  tone?: "default" | "primary" | "success" | "danger";
}) {
  const styles = {
    default: "border border-gray-200 text-gray-600 hover:bg-gray-50",
    primary: "bg-brand text-white hover:bg-brand-dark",
    success: "bg-emerald-500 text-white hover:bg-emerald-600",
    danger: "border border-red-200 text-red-500 hover:bg-red-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${styles[tone]}`}
    >
      {icon}
      {children}
    </button>
  );
}

/** One activity with the workflow actions the viewer is allowed to take (decided server-side). */
export function ActivityCard({ activity, isBusy, onAction }: ActivityCardProps) {
  const p = activity.permissions;
  const act = (action: ActivityAction) => () => onAction(action, activity);
  const showSteps = usesWorkflow(activity) && activity.status !== "cancelled";
  const needsAttention = activity.status === "rejected" || (activity.status === "ongoing" && !!activity.reviewComment);

  return (
    <article className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h2 className={`text-sm font-bold leading-tight text-gray-800 ${activity.status === "cancelled" ? "line-through" : ""}`}>
          {activity.title}
        </h2>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[activity.status]}`}>
            {statusLabels[activity.status]}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeStyles[activity.type]}`}>
            {typeLabels[activity.type]}
          </span>
          {activity.mode === "online" && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-600">Online</span>
          )}
        </div>
      </div>
      <p className="mb-3 line-clamp-2 text-xs text-gray-400">{activity.description}</p>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatActivityRange(activity.startDate, activity.endDate)}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          {activity.location}
        </span>
        <span className="flex items-center gap-1" title="Signed up">
          <Users size={11} />
          {activity.attendeeCount}
          {activity.maxAttendees ? ` / ${activity.maxAttendees}` : ""}
        </span>
        <span>{activity.isOrganizer ? "Organized by you" : `By ${nameWithRole(activity.organizerName, activity.organizerRole)}`}</span>
        {activity.isAttending && (
          <span className="flex items-center gap-1 font-medium text-emerald-600">
            <CheckCircle2 size={11} /> You&apos;re signed up
          </span>
        )}
      </div>

      {showSteps && (
        <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
          <WorkflowSteps status={activity.status} compact />
        </div>
      )}

      {needsAttention && activity.reviewComment && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <span className="font-semibold">{activity.reviewedByName ?? "Reviewer"}:</span> “{activity.reviewComment}”
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <ActionButton onClick={act("view")} disabled={false} icon={<Eye size={12} />}>
          Details
        </ActionButton>
        {p.canJoin && (
          <ActionButton onClick={act("join")} disabled={isBusy} icon={<LogIn size={12} />} tone="primary">
            Sign up
          </ActionButton>
        )}
        {p.canLeave && (
          <ActionButton onClick={act("leave")} disabled={isBusy} icon={<LogOut size={12} />}>
            Withdraw
          </ActionButton>
        )}
        {p.canSubmit && (
          <ActionButton onClick={act("submit")} disabled={isBusy} icon={<Send size={12} />} tone="primary">
            {activity.status === "rejected" ? "Resubmit" : "Submit for approval"}
          </ActionButton>
        )}
        {p.canWithdraw && (
          <ActionButton onClick={act("withdraw")} disabled={isBusy} icon={<Undo2 size={12} />}>
            Withdraw to draft
          </ActionButton>
        )}
        {p.canReview && (
          <>
            <ActionButton onClick={act("approve")} disabled={isBusy} icon={<ThumbsUp size={12} />} tone="success">
              Approve
            </ActionButton>
            <ActionButton onClick={act("reject")} disabled={isBusy} icon={<ThumbsDown size={12} />} tone="danger">
              Reject
            </ActionButton>
          </>
        )}
        {p.canStart && (
          <ActionButton onClick={act("start")} disabled={isBusy} icon={<Play size={12} />} tone="primary">
            Start
          </ActionButton>
        )}
        {p.canSubmitEvidence && (
          <ActionButton onClick={act("evidence")} disabled={isBusy} icon={<Upload size={12} />} tone="primary">
            Submit evidence
          </ActionButton>
        )}
        {p.canVerify && (
          <>
            <ActionButton onClick={act("verify")} disabled={isBusy} icon={<ClipboardCheck size={12} />} tone="success">
              Verify &amp; issue certificates
            </ActionButton>
            <ActionButton onClick={act("return")} disabled={isBusy} icon={<Undo2 size={12} />} tone="danger">
              Return
            </ActionButton>
          </>
        )}
        {p.canEdit && (
          <ActionButton onClick={act("edit")} disabled={isBusy} icon={<Pencil size={12} />}>
            Edit
          </ActionButton>
        )}
        {p.canCancel && (
          <ActionButton onClick={act("cancel")} disabled={isBusy} icon={<Ban size={12} />}>
            Cancel
          </ActionButton>
        )}
        {p.canDelete && (
          <ActionButton onClick={act("delete")} disabled={isBusy} icon={<Trash2 size={12} />} tone="danger">
            Delete
          </ActionButton>
        )}
      </div>
    </article>
  );
}
