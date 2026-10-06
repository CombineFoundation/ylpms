import { apiFetch } from "@/lib/api-client";
import { openAuthenticatedPdf } from "@/lib/report-attachments";
import { scopedPath } from "@/hooks/usePortalScope";
import type { ActivityWorkflowAction } from "@/types/activity.types";
import type { ReportAttachment } from "@/types/report.types";
import type { ScopedRole } from "@/utils/portal-scope";
import type { ActivityForm, ActivityPortal } from "./activity.types";

/** Whose portal a request is made from; `selectedId` is set when a developer acts as someone. */
export type ActivityScope = { portal: ActivityPortal; selectedId: string | null };

export function withScope(path: string, scope: ActivityScope) {
  return scope.portal === "head-ro" ? path : scopedPath(path, scope.portal as ScopedRole, scope.selectedId);
}

export function saveActivity(values: ActivityForm, activityId: string | null, scope: ActivityScope) {
  const body = {
    title: values.title,
    description: values.description,
    type: values.type,
    mode: values.mode,
    location: values.location,
    startDate: new Date(values.startDate).toISOString(),
    endDate: new Date(values.endDate).toISOString(),
  };
  return activityId
    ? apiFetch(withScope(`/api/activities/${activityId}`, scope), {
        method: "PATCH",
        // null clears a previously set attendee cap.
        body: { ...body, maxAttendees: values.maxAttendees ? Number(values.maxAttendees) : null },
      })
    : apiFetch(withScope("/api/activities", scope), {
        method: "POST",
        body: { ...body, maxAttendees: values.maxAttendees ? Number(values.maxAttendees) : undefined },
      });
}

export type WorkflowBody =
  | { action: Exclude<ActivityWorkflowAction, "submit-evidence">; comment?: string }
  | {
      action: "submit-evidence";
      evidence: { summary: string; participantIds: string[]; attachments: ReportAttachment[] };
    };

export function runWorkflow(activityId: string, body: WorkflowBody, scope: ActivityScope) {
  return apiFetch(withScope(`/api/activities/${activityId}/workflow`, scope), { method: "POST", body });
}

export function setAttendance(activityId: string, join: boolean, scope: ActivityScope) {
  return apiFetch<{ attendeeCount: number }>(withScope(`/api/activities/${activityId}/attendance`, scope), {
    method: "POST",
    body: { action: join ? "join" : "leave" },
  });
}

export function deleteActivity(activityId: string, scope: ActivityScope) {
  return apiFetch(withScope(`/api/activities/${activityId}`, scope), { method: "DELETE" });
}

export function openEvidencePdf(activityId: string, index: number, scope: ActivityScope) {
  return openAuthenticatedPdf(withScope(`/api/activities/${activityId}/evidence/${index}`, scope));
}
