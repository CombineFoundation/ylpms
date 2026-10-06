"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import type { UserRole } from "@/types/user.types";
import type { PublicStats } from "@/types/public-stats.types";
import { formatCount, formatReach } from "@/utils/impact-format";

/** An error whose message is safe and meant to be shown to the user as-is. */
class LoginError extends Error {}

export default function LoginContent({ stats }: { stats: PublicStats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const sessionExpired = reason === "expired";
  const accountDisabled = reason === "disabled";
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSigningIn(true);

    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password
      );
      const token = await credential.user.getIdToken();
      localStorage.setItem("token", token);

      // The server checks the account's status (blocking inactive/suspended
      // users), records the login, and returns the authoritative role.
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const sessionResult = await sessionResponse.json().catch(() => ({}));
      if (!sessionResponse.ok) {
        await signOut(getFirebaseAuth()).catch(() => undefined);
        localStorage.removeItem("token");
        throw new LoginError(
          sessionResult.error?.message || "Unable to start your session. Please try again."
        );
      }

      const role = sessionResult.data?.role as UserRole | undefined;
      const routes = {
        developer: "/Head-of-RO/dashboard",
        "head-ro": "/Head-of-RO/dashboard",
        sro: "/SRO/dashboard",
        ro: "/RO/dashboard",
        "youth-leader": "/youth-leader/dashboard",
        volunteer: "/volunteer/dashboard",
      } as const;

      if (!role || !(role in routes)) {
        throw new LoginError("Login succeeded, but no role was found in this user's profile.");
      }

      document.cookie = `role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      // After their cohort ends, youth leaders and volunteers can only open their certificates.
      const home = sessionResult.data?.accessClosed ? routes[role].replace(/\/dashboard$/, "/certificates") : routes[role];
      // New accounts replace their emailed temporary password first.
      router.replace(
        sessionResult.data?.mustChangePassword ? `/change-password?next=${encodeURIComponent(home)}` : home
      );
    } catch (loginError) {
      console.error("Login failed:", loginError);
      const code = (loginError as { code?: string } | null)?.code;
      setError(
        loginError instanceof LoginError
          ? loginError.message
          : code === "auth/user-disabled"
          ? "This account has been deactivated. Contact your administrator."
          : code === "auth/too-many-requests"
          ? "Too many attempts. Please wait a moment and try again."
          : "Invalid email or password. Please try again."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="relative w-full lg:w-1/2 min-h-125 lg:min-h-screen bg-brand overflow-hidden flex flex-col">
        {/* subtle diagonal shading in the lower right, matching the reference */}
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-black/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-2/3 h-1/2 bg-gradient-to-tl from-black/20 to-transparent" />

        {/* Logo / brand */}
        <div className="relative z-10 flex items-center gap-2 px-8 pt-8 sm:px-12 sm:pt-10">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B2540] text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M12 3l8 4-8 4-8-4 8-4z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 11v5c0 1.5 3.5 3 8 3s8-1.5 8-3v-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-white text-sm font-semibold tracking-wide">
            Youth Leadership Program
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-12 max-w-xl">
          <span className="inline-block w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-white mb-5">
            JOIN {stats.current.name.toUpperCase()}
          </span>

          <h1 className="text-white font-bold leading-tight text-3xl sm:text-4xl lg:text-[2.6rem] mb-4">
            Open to every
            <br />
            Pakistani university
            <br />
            student.
          </h1>

          <p className="text-white/85 text-sm sm:text-base max-w-md">
            It&rsquo;s not about being the &ldquo;best&rdquo; student. It&rsquo;s about
            investing your time, passion, and energy to make a difference in
            your community.
          </p>
        </div>

        {/* Impact stats bar */}
        <div className="relative z-10 mx-6 mb-6 sm:mx-10 sm:mb-10 rounded-md bg-[#1B2540] px-6 py-5 sm:px-8 sm:py-6">
          <p className="text-[10px] font-semibold tracking-widest text-white/60 mb-4">
            OUR IMPACT IN NUMBERS
          </p>
          <div className="grid grid-cols-3 gap-4 divide-x divide-white/10">
            <div>
              <p className="text-brand font-bold text-xl sm:text-2xl">
                {formatCount(stats.total.webinars + stats.total.onsiteWorkshops)}
              </p>
              <p className="text-white/60 text-[11px] sm:text-xs mt-1">
                Workshops &amp; Webinars
              </p>
            </div>
            <div className="pl-4">
              <p className="text-brand font-bold text-xl sm:text-2xl">
                {formatCount(stats.total.directBeneficiaries)}
              </p>
              <p className="text-white/60 text-[11px] sm:text-xs mt-1">
                Direct Beneficiaries
              </p>
            </div>
            <div className="pl-4">
              <p className="text-brand font-bold text-xl sm:text-2xl">
                {formatReach(stats.total.digitalReach)}
              </p>
              <p className="text-white/60 text-[11px] sm:text-xs mt-1">
                Digital Reach
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Enter your credentials to access your youth portal
          </p>

          {sessionExpired && !error && (
            <p className="mb-5 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Your session expired. Please sign in again.
            </p>
          )}

          {accountDisabled && !error && (
            <p className="mb-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              Your account has been deactivated or suspended. Contact your administrator.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full rounded-md border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-md border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs text-gray-500 hover:text-brand transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2"
            >
              {isSigningIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </div>
  );
}