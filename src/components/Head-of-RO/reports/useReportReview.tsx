"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiFetch, errorMessage } from "@/lib/api-client";

type Decision = "approved" | "rejected";
type PendingReview = { id: string; title: string; decision: Decision } | null;

/**
 * Approve / ask-for-changes flow shared by the Reports pages and the dashboard:
 * always confirms, lets the reviewer leave feedback, and requires it when asking for changes.
 */
export function useReportReview(onReviewed: (reportId: string, decision: Decision) => void) {
  const [pending, setPending] = useState<PendingReview>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReview = (report: { id: string; title: string }, decision: Decision) => {
    setError(null);
    setPending({ ...report, decision });
  };

  const submit = async (comment: string) => {
    if (!pending) return;
    setIsBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/reports/${pending.id}`, {
        method: "PATCH",
        body: { status: pending.decision, reviewComment: comment || undefined },
      });
      onReviewed(pending.id, pending.decision);
      setPending(null);
    } catch (err) {
      setError(errorMessage(err, "Unable to update report."));
    } finally {
      setIsBusy(false);
    }
  };

  const isReject = pending?.decision === "rejected";

  const dialog = (
    <ConfirmDialog
      isOpen={!!pending}
      title={isReject ? "Ask for changes?" : "Approve report?"}
      message={
        <>
          <span className="font-medium text-gray-800">&ldquo;{pending?.title}&rdquo;</span>
          {isReject ? " goes back to the submitter to edit and resubmit." : " will be marked approved and the submitter notified."}
        </>
      }
      confirmLabel={isReject ? "Ask for changes" : "Approve"}
      tone={isReject ? "danger" : "primary"}
      comment={
        isReject
          ? { label: "What needs to change", placeholder: "Tell them what to fix", required: true, minLength: 3 }
          : { label: "Feedback (optional)", placeholder: "Anything the submitter should know?" }
      }
      isBusy={isBusy}
      error={error}
      onConfirm={submit}
      onCancel={() => !isBusy && setPending(null)}
    />
  );

  return { requestReview, dialog, reviewingId: isBusy ? pending?.id ?? null : null };
}
