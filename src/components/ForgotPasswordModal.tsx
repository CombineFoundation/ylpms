"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, X, CheckCircle2, ArrowLeft } from "lucide-react";

type ForgotStep = "email" | "otp" | "done";

interface ForgotPasswordModalProps {
  /** Controls whether the modal is rendered/visible */
  isOpen: boolean;
  /** Called when the user closes the modal (X button, "Done" button) */
  onClose: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<ForgotStep>("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formError, setFormError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Reset internal state whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep("email");
      setRecoveryEmail("");
      setOtp(["", "", "", "", "", ""]);
      setFormError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleClose = () => {
    setFormError("");
    onClose();
  };

  const requestOtp = async (targetEmail: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to send verification code.");
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSending(true);
    try {
      await requestOtp(recoveryEmail);
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
      setResendTimer(30);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isSending) return;
    setFormError("");
    setIsSending(true);
    try {
      await requestOtp(recoveryEmail);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const digits = pasted.slice(0, otp.length).split("");
    const next = [...otp];
    digits.forEach((d, i) => (next[i] = d));
    setOtp(next);
    const nextEmptyIndex = next.findIndex((d) => d === "");
    otpRefs.current[nextEmptyIndex === -1 ? otp.length - 1 : nextEmptyIndex]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail, code: otp.join("") }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect code. Please try again.");
      }
      setStep("done");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const isOtpComplete = otp.every((d) => d !== "");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm rounded-xl bg-white p-7 shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step 1: enter recovery gmail */}
        {step === "email" && (
          <>
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#E8622C]/10">
              <Mail className="h-5 w-5 text-[#E8622C]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">
              Reset your password
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Enter the Gmail address linked to your account and we&rsquo;ll
              send a verification code to it.
            </p>
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label
                  htmlFor="recovery-email"
                  className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                  Gmail Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    pattern=".+@gmail\.com"
                    title="Please enter a valid Gmail address"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full rounded-md border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8622C]/40 focus:border-[#E8622C]"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium text-red-500">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full rounded-full bg-[#E8622C] py-3 text-sm font-semibold text-white hover:bg-[#d9551f] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8622C]/50 focus:ring-offset-2"
              >
                {isSending ? "Sending..." : "Send Code"}
              </button>
            </form>
          </>
        )}

        {/* Step 2: enter OTP */}
        {step === "otp" && (
          <>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="mb-4 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#E8622C]/10">
              <Mail className="h-5 w-5 text-[#E8622C]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">
              Enter verification code
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-gray-700">
                {recoveryEmail || "your Gmail"}
              </span>
              . Enter it below to continue.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className="h-12 w-11 rounded-md border border-gray-200 text-center text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E8622C]/40 focus:border-[#E8622C]"
                  />
                ))}
              </div>

              {formError && (
                <p className="-mt-3 text-xs font-medium text-red-500">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {resendTimer > 0
                    ? `Resend code in 0:${String(resendTimer).padStart(2, "0")}`
                    : "Didn't receive it?"}
                </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isSending}
                  className="font-semibold text-[#E8622C] hover:text-[#d9551f] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? "Sending..." : "Resend OTP"}
                </button>
              </div>

              <button
                type="submit"
                disabled={!isOtpComplete || isVerifying}
                className="w-full rounded-full bg-[#E8622C] py-3 text-sm font-semibold text-white hover:bg-[#d9551f] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8622C]/50 focus:ring-offset-2"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          </>
        )}

        {/* Step 3: done */}
        {step === "done" && (
          <div className="text-center py-2">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">
              Verified successfully
            </h3>
            <p className="text-sm text-gray-500 mb-7">
              Your Gmail has been verified. You can now sign in again or
              set a new password from your inbox link.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-full bg-[#E8622C] py-3 text-sm font-semibold text-white hover:bg-[#d9551f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8622C]/50 focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}