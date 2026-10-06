"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { applicationSchema, type ApplicationInput } from "@/utils/application-validation";

type Props = { open: boolean; onClose: () => void };

const FIELDS = ["name", "email", "contact"] as const;

/** The application form every "Apply" button on the landing page opens. No sign-in needed. */
export default function ApplyModal({ open, onClose }: Props) {
  const [status, setStatus] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const firstInput = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({ defaultValues: { name: "", email: "", contact: "", website: "" } });

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open");
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    firstInput.current?.focus();
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Start fresh next time once an application has gone through.
  const close = () => {
    if (referenceNumber) {
      reset();
      setReferenceNumber("");
    }
    setStatus("");
    onClose();
  };

  const onSubmit = async (values: ApplicationInput) => {
    setStatus("");
    const parsed = applicationSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.errors.forEach((issue) => {
        const field = issue.path[0];
        if (FIELDS.includes(field as (typeof FIELDS)[number])) {
          setError(field as (typeof FIELDS)[number], { message: issue.message });
        }
      });
      return;
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!result.success) {
        setStatus(result.error?.message || "We couldn't submit your application. Please try again.");
        return;
      }
      setReferenceNumber(result.data.referenceNumber);
    } catch {
      setStatus("We couldn't reach the server. Check your connection and try again.");
    }
  };

  const nameField = register("name");

  return (
    <div
      className={`modal${open ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="applyTitle"
      aria-hidden={!open}
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div className="modal-card">
        <div className="modal-head">
          <h3 id="applyTitle">Apply for YLP</h3>
          <p>Share your details and our Reporting Officers will contact you with the next steps.</p>
          <button type="button" className="modal-close" onClick={close} aria-label="Close application form">
            &#10005;
          </button>
        </div>

        <div className="modal-body">
          {!referenceNumber ? (
            <div>
              <div className={`form-status error${status ? " show" : ""}`} role="alert">{status}</div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="field">
                  <label htmlFor="apply-name">Full name <span className="req">*</span></label>
                  <input
                    type="text"
                    id="apply-name"
                    autoComplete="name"
                    placeholder="Ayesha Khan"
                    aria-invalid={!!errors.name}
                    {...nameField}
                    ref={(element) => {
                      nameField.ref(element);
                      firstInput.current = element;
                    }}
                  />
                  <div className={`error${errors.name ? " show" : ""}`}>{errors.name?.message}</div>
                </div>

                <div className="field">
                  <label htmlFor="apply-email">Email address <span className="req">*</span></label>
                  <input
                    type="email"
                    id="apply-email"
                    autoComplete="email"
                    placeholder="ayesha@university.edu.pk"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  <div className={`error${errors.email ? " show" : ""}`}>{errors.email?.message}</div>
                </div>

                <div className="field">
                  <label htmlFor="apply-contact">Contact number <span className="req">*</span></label>
                  <input
                    type="tel"
                    id="apply-contact"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="03001234567"
                    aria-invalid={!!errors.contact}
                    {...register("contact")}
                  />
                  <div className="hint">Pakistani mobile number, with or without +92.</div>
                  <div className={`error${errors.contact ? " show" : ""}`}>{errors.contact?.message}</div>
                </div>

                {/* Honeypot: off-screen and skipped by keyboard and screen readers; bots fill it in. */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                  {...register("website")}
                />

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit application"}
                </button>

                <p className="form-note">We use your details only to contact you about YLP 2.0.</p>
              </form>
            </div>
          ) : (
            <div className="form-success show" role="status">
              <div className="success-mark">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h4>Application received</h4>
              <p>
                Thank you for applying to the Youth Leadership Program 2.0. Keep your reference number, our team will
                be in touch by email.
              </p>
              <div className="ref">{referenceNumber}</div>
              <div>
                <button type="button" className="btn btn-outline-navy" onClick={close}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
