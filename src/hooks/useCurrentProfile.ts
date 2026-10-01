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
};

type ProfileStore = {
  profile: CurrentProfile | null;
  status: "idle" | "loading" | "loaded" | "error";
  load: () => Promise<void>;
  setProfile: (profile: Partial<CurrentProfile>) => void;
};

const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  status: "idle",
  load: async () => {
    if (get().status === "loading") return;
    set({ status: "loading" });
    try {
      const profile = await apiFetch<CurrentProfile>("/api/users/me");
      set({ profile, status: "loaded" });
    } catch {
      set({ status: "error" });
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
  const { profile, status, load, setProfile } = useProfileStore();

  useEffect(() => {
    if (status === "idle") load();
  }, [status, load]);

  return { profile, isLoading: status === "idle" || status === "loading", setProfile, reload: load };
}

export const roleTitles: Record<UserRole, string> = {
  developer: "Developer",
  "head-ro": "Head Reporting Officer",
  sro: "Senior Reporting Officer",
  ro: "Reporting Officer",
  "youth-leader": "Youth Leader",
  volunteer: "Volunteer",
};
