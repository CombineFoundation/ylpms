"use client";

import { ReactNode, useEffect, useState } from "react";
import { Modal } from "./Modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  isBusy?: boolean;
  error?: string | null;
  /** Renders a textarea whose value is passed to onConfirm (e.g. a rejection reason). */
  comment?: { label: string; placeholder?: string; required?: boolean; minLength?: number };
  /**
   * Renders a one-line input whose value is passed to onConfirm as the second
   * argument (e.g. an ID to assign). `validate` returns an error message or null.
   */
  field?: { label: string; placeholder?: string; hint?: string; validate: (value: string) => string | null };
  /** Optional secondary action, e.g. "Deactivate instead" next to "Delete". */
  secondaryAction?: { label: string; onClick: () => void };
  onConfirm: (comment: string, fieldValue: string) => void;
  onCancel: () => void;
};

/** Replacement for window.confirm with consistent styling, busy state, and inline errors. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "primary",
  isBusy = false,
  error,
  comment,
  field,
  secondaryAction,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [text, setText] = useState("");
  const [fieldText, setFieldText] = useState("");
  const [fieldTouched, setFieldTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setText("");
      setFieldText("");
      setFieldTouched(false);
    }
  }, [isOpen]);

  const fieldError = field ? field.validate(fieldText.trim()) : null;

  const minLength = comment?.required ? comment.minLength ?? 1 : 0;
  const commentInvalid = !!comment && text.trim().length < minLength;

  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel} isBusy={isBusy}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setFieldTouched(true);
          if (!commentInvalid && !fieldError) onConfirm(text.trim(), fieldText.trim());
        }}
        className="space-y-4"
      >
        {message && <div className="text-sm text-gray-600">{message}</div>}

        {field && (
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            <input
              data-autofocus
              value={fieldText}
              placeholder={field.placeholder}
              onChange={(event) => setFieldText(event.target.value)}
              onBlur={() => setFieldTouched(true)}
              aria-invalid={fieldTouched && !!fieldError}
              className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal uppercase text-gray-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {fieldTouched && fieldError ? (
              <span className="mt-1 block text-xs font-normal text-red-500">{fieldError}</span>
            ) : (
              field.hint && <span className="mt-1 block text-xs font-normal text-gray-400">{field.hint}</span>
            )}
          </label>
        )}

        {comment && (
          <label className="block text-sm font-medium text-gray-700">
            {comment.label}
            <textarea
              data-autofocus={field ? undefined : true}
              rows={3}
              value={text}
              placeholder={comment.placeholder}
              onChange={(event) => setText(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {comment.required && (
              <span className="mt-1 block text-xs font-normal text-gray-400">
                Required{minLength > 1 ? ` (at least ${minLength} characters)` : ""}.
              </span>
            )}
          </label>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={isBusy}
              className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5 disabled:opacity-60"
            >
              {secondaryAction.label}
            </button>
          )}
          <button
            type="submit"
            data-autofocus={comment || field ? undefined : true}
            disabled={isBusy || commentInvalid}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-brand-dark"
            }`}
          >
            {isBusy ? "Working..." : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
