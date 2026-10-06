"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Blocks Escape/backdrop/close-button dismissal, e.g. while saving. */
  isBusy?: boolean;
  size?: "md" | "lg" | "xl";
  description?: string;
};

const sizeClass = { md: "max-w-md", lg: "max-w-2xl", xl: "max-w-3xl" };

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: role="dialog" + aria-modal, Escape and backdrop click to
 * close, focus moved into the dialog on open, Tab trapped inside, and focus
 * restored to the trigger on close.
 *
 * Once anything has been typed or picked inside it, Escape and a stray tap on
 * the backdrop ask before discarding; the close button (and a form's own
 * Cancel) still close straight away.
 */
export function Modal({ isOpen, title, onClose, children, isBusy = false, size = "md", description }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const busyRef = useRef(isBusy);
  busyRef.current = isBusy;
  const dirtyRef = useRef(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const confirmingRef = useRef(false);
  confirmingRef.current = confirmingDiscard;

  /** Escape / backdrop: close, unless there are changes to lose. */
  const requestCloseRef = useRef(() => {});
  requestCloseRef.current = () => {
    if (busyRef.current) return;
    if (dirtyRef.current) setConfirmingDiscard(true);
    else onCloseRef.current();
  };

  useEffect(() => {
    if (!isOpen) return;
    dirtyRef.current = false;
    setConfirmingDiscard(false);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const first =
      dialog?.querySelector<HTMLElement>("[data-autofocus]") ||
      bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE) ||
      dialog?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      // A control inside (e.g. an open dropdown) already used this Escape.
      if (event.key === "Escape" && !event.defaultPrevented && !busyRef.current) {
        event.stopPropagation();
        if (confirmingRef.current) setConfirmingDiscard(false);
        else requestCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestCloseRef.current();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`relative flex max-h-[90vh] w-full ${sizeClass[size]} flex-col overflow-hidden rounded-xl bg-white shadow-xl`}
        // Anything typed or picked counts as a change worth keeping.
        onInput={() => {
          dirtyRef.current = true;
        }}
        onChange={() => {
          dirtyRef.current = true;
        }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>
        {confirmingDiscard && (
          <div
            role="alertdialog"
            aria-label="Discard changes?"
            className="absolute inset-0 flex items-center justify-center bg-white/85 px-6 backdrop-blur-[1px]"
          >
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 text-center shadow-lg">
              <p className="font-semibold text-gray-900">Discard your changes?</p>
              <p className="mt-1 text-sm text-gray-500">What you&apos;ve entered in this form will be lost.</p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirmingDiscard(false)}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDiscard(false);
                    onClose();
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
