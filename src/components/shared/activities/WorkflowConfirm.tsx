"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteActivity, runWorkflow, type ActivityScope } from "./activity.api";
import type { ActivityAction } from "./ActivityCard";
import type { ApiActivity } from "./activity.types";

export type ConfirmableAction = Exclude<ActivityAction, "view" | "edit" | "evidence" | "join" | "leave">;

type Config = {
  title: string;
  message: (activity: ApiActivity) => string;
  confirmLabel: string;
  tone: "primary" | "danger";
  comment?: { label: string; placeholder?: string; required?: boolean; minLength?: number };
  done: (activity: ApiActivity) => string;
};

const CONFIG: Record<ConfirmableAction, Config> = {
  submit: {
    title: "Submit for approval?",
    message: (a) => `"${a.title}" goes to your RO for review. To change it while it's awaiting approval, withdraw it to draft.`,
    confirmLabel: "Submit",
    tone: "primary",
    done: (a) => `"${a.title}" was submitted for approval.`,
  },
  withdraw: {
    title: "Withdraw to draft?",
    message: (a) => `"${a.title}" comes back to you as a draft so you can change it. Submit it again when it's ready.`,
    confirmLabel: "Withdraw",
    tone: "primary",
    done: (a) => `"${a.title}" is a draft again.`,
  },
  approve: {
    title: "Approve activity?",
    message: (a) => `"${a.title}" by ${a.organizerName} will be scheduled and open for sign-ups.`,
    confirmLabel: "Approve",
    tone: "primary",
    comment: { label: "Note to the organizer (optional)" },
    done: (a) => `"${a.title}" was approved.`,
  },
  reject: {
    title: "Reject activity?",
    message: (a) => `${a.organizerName} will see your reason and can edit and resubmit "${a.title}".`,
    confirmLabel: "Reject",
    tone: "danger",
    comment: { label: "What needs to change", placeholder: "Explain what to fix before it can be approved", required: true, minLength: 3 },
    done: (a) => `"${a.title}" was sent back to ${a.organizerName}.`,
  },
  start: {
    title: "Start activity?",
    message: (a) => `Marks "${a.title}" as in progress. Submit evidence once it's done.`,
    confirmLabel: "Start",
    tone: "primary",
    done: (a) => `"${a.title}" is in progress.`,
  },
  verify: {
    title: "Verify and issue certificates?",
    message: (a) =>
      `Confirms the evidence for "${a.title}" and issues a certificate to each of its ${
        a.evidence?.participantIds.length ?? 0
      } participant(s) and the organizer (youth leaders and volunteers only). Check the evidence under “Details” first.`,
    confirmLabel: "Verify & issue",
    tone: "primary",
    comment: { label: "Note to the organizer (optional)" },
    done: (a) => `"${a.title}" was verified and certificates were issued.`,
  },
  return: {
    title: "Return evidence?",
    message: (a) => `${a.organizerName} will see your reason and can resubmit evidence for "${a.title}".`,
    confirmLabel: "Return",
    tone: "danger",
    comment: { label: "What needs to change", placeholder: "e.g. The attendance sheet is missing", required: true, minLength: 3 },
    done: (a) => `Evidence for "${a.title}" was returned.`,
  },
  cancel: {
    title: "Cancel activity?",
    message: (a) => `"${a.title}" will be marked as cancelled and anyone signed up will be told.`,
    confirmLabel: "Cancel activity",
    tone: "danger",
    comment: { label: "Reason (optional)" },
    done: (a) => `"${a.title}" was cancelled.`,
  },
  delete: {
    title: "Delete activity?",
    message: (a) => `"${a.title}" will be permanently deleted.`,
    confirmLabel: "Delete",
    tone: "danger",
    done: (a) => `"${a.title}" was deleted.`,
  },
};

/** API action for each confirmable card action ("return" is "return-evidence" on the server). */
const WORKFLOW_ACTION = {
  submit: "submit",
  withdraw: "withdraw",
  approve: "approve",
  reject: "reject",
  start: "start",
  verify: "verify",
  return: "return-evidence",
  cancel: "cancel",
} as const;

type WorkflowConfirmProps = {
  pending: { action: ConfirmableAction; activity: ApiActivity } | null;
  scope: ActivityScope;
  onCancel: () => void;
  onDone: (message: string) => void;
};

/** Confirms a workflow step (with a comment where one is useful or required), then runs it. */
export function WorkflowConfirm({ pending, scope, onCancel, onDone }: WorkflowConfirmProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pending) setError(null);
  }, [pending]);

  const config = pending ? CONFIG[pending.action] : null;

  const confirm = async (comment: string) => {
    if (!pending || !config) return;
    setIsBusy(true);
    setError(null);
    try {
      if (pending.action === "delete") {
        await deleteActivity(pending.activity.id, scope);
      } else {
        await runWorkflow(pending.activity.id, { action: WORKFLOW_ACTION[pending.action], comment: comment || undefined }, scope);
      }
      onDone(config.done(pending.activity));
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={!!pending}
      title={config?.title ?? ""}
      message={pending && config ? config.message(pending.activity) : undefined}
      confirmLabel={config?.confirmLabel}
      tone={config?.tone}
      comment={config?.comment}
      isBusy={isBusy}
      error={error}
      onConfirm={confirm}
      onCancel={() => !isBusy && onCancel()}
    />
  );
}
