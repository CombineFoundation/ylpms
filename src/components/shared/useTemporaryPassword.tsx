"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiFetch, errorMessage } from "@/lib/api-client";

type Member = { id: string; name: string; email?: string };

type Pending = { kind: "confirm"; member: Member } | { kind: "done"; member: Member; password: string };

/**
 * "Set temporary password" for members who have never signed in, e.g. when
 * their welcome email never arrived. The new password is shown once so it can
 * be passed on directly (WhatsApp, call); they must change it on first sign-in.
 */
export function useTemporaryPassword() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const close = () => {
    if (isBusy) return;
    setPending(null);
    setError(null);
    setCopied(false);
  };

  const request = (member: Member) => {
    setError(null);
    setCopied(false);
    setPending({ kind: "confirm", member });
  };

  const setPassword = async (member: Member) => {
    setIsBusy(true);
    setError(null);
    try {
      const data = await apiFetch<{ password: string }>(`/api/users/${member.id}/temporary-password`, { method: "POST" });
      setPending({ kind: "done", member, password: data.password });
    } catch (err) {
      setError(errorMessage(err, "Couldn't set a new password. Please try again."));
    } finally {
      setIsBusy(false);
    }
  };

  const copy = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  let dialog = null;
  if (pending?.kind === "confirm") {
    const { member } = pending;
    dialog = (
      <ConfirmDialog
        isOpen
        title={`Set a temporary password for ${member.name}?`}
        tone="primary"
        confirmLabel="Set password"
        isBusy={isBusy}
        error={error}
        message={`Any password emailed to ${member.email ?? "them"} earlier will stop working. You'll see the new one once, to send them directly; they'll choose their own when they first sign in.`}
        onConfirm={() => setPassword(member)}
        onCancel={close}
      />
    );
  } else if (pending?.kind === "done") {
    const { member, password } = pending;
    dialog = (
      <ConfirmDialog
        isOpen
        title="Temporary password set"
        tone="primary"
        confirmLabel="Done"
        message={
          <div className="space-y-3">
            <p>
              Send this to {member.name} directly (not by email). They sign in with {member.email ?? "their email"} and
              this password. It won&apos;t be shown again.
            </p>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <code className="select-all font-mono text-base text-gray-800">{password}</code>
              <button
                type="button"
                onClick={() => copy(password)}
                className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        }
        onConfirm={close}
        onCancel={close}
      />
    );
  }

  return { request, dialog };
}
