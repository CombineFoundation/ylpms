"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formError, setFormError] = useState("");
  const { sendPasswordReset } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setIsSending(false);
      setIsComplete(false);
      setFormError("");
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    setIsSending(true);

    try {
      await sendPasswordReset(email.trim());
      setIsComplete(true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to send the reset email."
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
    >
      <div className="relative w-full max-w-sm rounded-xl bg-white p-7 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {isComplete ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <h3 id="reset-password-title" className="text-lg font-bold text-gray-900">
              Check your email
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              If an account uses this email, Firebase has sent a password-reset link.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 w-full rounded-full bg-[#E8622C] py-3 text-sm font-semibold text-white hover:bg-[#d9551f]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#E8622C]/10">
              <Mail className="h-5 w-5 text-[#E8622C]" />
            </div>
            <h3 id="reset-password-title" className="text-lg font-bold text-gray-900">
              Reset your password
            </h3>
            <p className="mb-6 mt-1.5 text-sm text-gray-500">
              Enter the email address associated with your account and we&rsquo;ll
              send a secure reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="recovery-email" className="mb-1.5 block text-sm font-medium text-gray-800">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@university.edu"
                    className="w-full rounded-md border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E8622C] focus:outline-none focus:ring-2 focus:ring-[#E8622C]/40"
                  />
                </div>
              </div>

              {formError && <p className="text-xs font-medium text-red-500">{formError}</p>}

              <button
                type="submit"
                disabled={isSending}
                className="w-full rounded-full bg-[#E8622C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d9551f] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSending ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
