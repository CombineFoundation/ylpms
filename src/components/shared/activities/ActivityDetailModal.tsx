"use client";

import { useEffect, useState } from "react";
import { Calendar, FileText, MapPin, Users } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { formatFileSize } from "@/lib/report-attachments";
import { roleTitles } from "@/hooks/useCurrentProfile";
import { formatRelativeTime } from "@/utils/user-status";
import { Modal } from "@/components/ui/Modal";
import { openEvidencePdf, withScope, type ActivityScope } from "./activity.api";
import { WorkflowSteps } from "./WorkflowSteps";
import {
  formatActivityRange,
  statusLabels,
  statusStyles,
  typeLabels,
  usesWorkflow,
  type ApiActivityDetail,
} from "./activity.types";

type ActivityDetailModalProps = {
  activityId: string | null;
  scope: ActivityScope;
  onClose: () => void;
};

function PeopleList({ title, people }: { title: string; people: { id: string; name: string; role: keyof typeof roleTitles }[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-700">
        {title} <span className="font-normal text-gray-400">({people.length})</span>
      </h3>
      {people.length === 0 ? (
        <p className="mt-1 text-sm text-gray-400">No one yet.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {people.map((person) => (
            <li key={person.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700" title={roleTitles[person.role]}>
              {person.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Everything about one activity; organizers and reviewers also see sign-ups and evidence. */
export function ActivityDetailModal({ activityId, scope, onClose }: ActivityDetailModalProps) {
  const [activity, setActivity] = useState<ApiActivityDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (!activityId) return;
    setActivity(null);
    setError(null);
    setPdfError(null);
    let cancelled = false;
    apiFetch<ApiActivityDetail>(withScope(`/api/events/${activityId}`, scope))
      .then((loaded) => !cancelled && setActivity(loaded))
      .catch((err) => !cancelled && setError(errorMessage(err, "Unable to load this activity.")));
    return () => {
      cancelled = true;
    };
  }, [activityId, scope]);

  const openPdf = async (index: number) => {
    if (!activity) return;
    setPdfError(null);
    try {
      await openEvidencePdf(activity.id, index, scope);
    } catch (err) {
      setPdfError(errorMessage(err, "Couldn't open this PDF."));
    }
  };

  return (
    <Modal isOpen={!!activityId} title={activity?.title ?? "Activity"} onClose={onClose} size="lg">
      {!activity && !error && <p className="text-sm text-gray-400">Loading...</p>}
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
      {activity && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[activity.status]}`}>
              {statusLabels[activity.status]}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {typeLabels[activity.type]}
              {activity.mode === "online" ? " · Online" : " · Onsite"}
            </span>
            <span className="text-xs text-gray-400">Organized by {activity.organizerName}</span>
          </div>

          {usesWorkflow(activity) && activity.status !== "cancelled" && <WorkflowSteps status={activity.status} compact />}

          <p className="whitespace-pre-line text-sm text-gray-600">{activity.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatActivityRange(activity.startDate, activity.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {activity.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {activity.attendeeCount}
              {activity.maxAttendees ? ` / ${activity.maxAttendees}` : ""} signed up
            </span>
          </div>

          {activity.reviewComment && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                activity.status === "rejected" || activity.status === "ongoing" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600"
              }`}
            >
              <span className="font-semibold">{activity.reviewedByName ?? "Reviewer"}:</span> “{activity.reviewComment}”
              {activity.reviewedAt && <span className="text-xs opacity-70"> · {formatRelativeTime(activity.reviewedAt)}</span>}
            </div>
          )}

          {activity.attendeeList && <PeopleList title="Signed up" people={activity.attendeeList} />}

          {activity.evidence && (
            <section className="space-y-3 rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Evidence
                <span className="ml-2 font-normal text-gray-400">submitted {formatRelativeTime(activity.evidence.submittedAt)}</span>
              </h3>
              <p className="whitespace-pre-line text-sm text-gray-600">{activity.evidence.summary}</p>
              {activity.participantList && <PeopleList title="Participants" people={activity.participantList} />}
              {activity.evidence.attachments.length > 0 && (
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                  {activity.evidence.attachments.map((attachment, index) => (
                    <li key={attachment.path}>
                      <button
                        type="button"
                        onClick={() => openPdf(index)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-red-500" />
                        <span className="truncate text-gray-700 hover:underline">{attachment.name}</span>
                        <span className="shrink-0 text-xs text-gray-400">{formatFileSize(attachment.size)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {pdfError && (
                <p role="alert" className="text-sm text-red-500">
                  {pdfError}
                </p>
              )}
            </section>
          )}

          {activity.status === "completed" && !!activity.certificateCount && (
            <p className="text-sm text-emerald-700">{activity.certificateCount} certificate(s) issued.</p>
          )}
        </div>
      )}
    </Modal>
  );
}
