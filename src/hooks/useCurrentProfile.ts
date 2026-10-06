"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { apiFetch } from "@/lib/api-client";
import type { UserRole } from "@/types/user.types";

export type CurrentProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  region?: string;
  university?: string;
  /** Youth leaders and volunteers: when their cohort ends; once `closed`, only Certificates stay open. */
  cohortAccess?: { closed: boolean; endsAt: string | null; message: string | null } | null;
};

type ProfileStore = {
  profile: CurrentProfile | null;
  status: "idle" | "loading" | "loaded" | "error";
  /** Failed attempts since the last success; drives the automatic retry. */
  failures: number;
  load: () => Promise<void>;
  setProfile: (profile: Partial<CurrentProfile>) => void;
};

/** Every portal page waits for the profile, so a failed load is retried rather than leaving pages loading forever. */
const MAX_AUTO_RETRIES = 3;
const retryDelayMs = (failures: number) => 1000 * 2 ** (failures - 1);

const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  status: "idle",
  failures: 0,
  load: async () => {
    if (get().status === "loading") return;
    set({ status: "loading" });
    try {
      const profile = await apiFetch<CurrentProfile>("/api/users/me");
      set({ profile, status: "loaded", failures: 0 });
    } catch {
      const failures = get().failures + 1;
      set({ status: "error", failures });
      if (failures <= MAX_AUTO_RETRIES) setTimeout(() => get().load(), retryDelayMs(failures));
    }
  },
  setProfile: (changes) => {
    const current = get().profile;
    if (current) set({ profile: { ...current, ...changes } });
  },
}));

/**
 * The signed-in user's profile, fetched once and shared by the sidebar,
 * topbar, dashboard greeting and settings page. Call `setProfile` after a
 * successful profile save so every consumer updates immediately.
 */
export function useCurrentProfile() {
  const { profile, status, failures, load, setProfile } = useProfileStore();

  useEffect(() => {
    if (status === "idle") load();
  }, [status, load]);

  return {
    profile,
    isLoading: status === "idle" || status === "loading",
    /** True once automatic retries are used up; show an error with a retry (`reload`). */
    hasError: status === "error" && failures > MAX_AUTO_RETRIES,
    setProfile,
    reload: load,
  };
}

export const roleTitles: Record<UserRole, string> = {
  developer: "Developer",
  "head-ro": "Head Reporting Officer",
  sro: "Senior Reporting Officer",
  ro: "Reporting Officer",
  "youth-leader": "Youth Leader",
  volunteer: "Volunteer",
};
