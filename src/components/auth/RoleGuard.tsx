"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardPathForRole } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/auth.types";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { status, profile, error, signOut } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (
      status === "authenticated" &&
      profile &&
      profile.role !== "developer" &&
      !allowedRoles.includes(profile.role)
    ) {
      router.replace(dashboardPathForRole(profile.role));
    }
  }, [allowedRoles, profile, router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen animate-pulse bg-slate-50" aria-label="Loading account" />;
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Account access unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-5 rounded-full bg-[#E8622C] px-5 py-2 text-sm font-semibold text-white"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  if (
    !profile ||
    (profile.role !== "developer" && !allowedRoles.includes(profile.role))
  ) {
    return <div className="min-h-screen animate-pulse bg-slate-50" aria-label="Redirecting" />;
  }

  return <>{children}</>;
}
