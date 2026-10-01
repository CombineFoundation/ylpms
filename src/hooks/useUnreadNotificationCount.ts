"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { apiFetch } from "@/lib/api-client";

type UnreadStore = {
  count: number;
  refresh: () => Promise<void>;
  /** Optimistically adjust after a local mark-read/delete, before the next refresh. */
  adjust: (delta: number) => void;
  set: (count: number) => void;
};

export const useUnreadStore = create<UnreadStore>((set) => ({
  count: 0,
  refresh: async () => {
    try {
      if (!window.localStorage.getItem("token")) return;
      const data = await apiFetch<{ count: number }>("/api/notifications/unread-count");
      set({ count: data?.count || 0 });
    } catch {
      // Best-effort — the badge just stays at its last known value.
    }
  },
  adjust: (delta) => set((state) => ({ count: Math.max(0, state.count + delta) })),
  set: (count) => set({ count: Math.max(0, count) }),
}));

// One poller for the whole app, however many badges are mounted.
let subscribers = 0;
let interval: ReturnType<typeof setInterval> | null = null;

/**
 * Shared unread-notification count. The sidebar and topbar badges read the
 * same store, and the notifications page updates it on mark-read/delete, so
 * every badge stays in sync instead of each polling on its own.
 */
export function useUnreadNotificationCount() {
  const count = useUnreadStore((state) => state.count);

  useEffect(() => {
    subscribers += 1;
    if (subscribers === 1) {
      useUnreadStore.getState().refresh();
      interval = setInterval(() => useUnreadStore.getState().refresh(), 60_000);
    }
    return () => {
      subscribers -= 1;
      if (subscribers === 0 && interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, []);

  return count;
}
