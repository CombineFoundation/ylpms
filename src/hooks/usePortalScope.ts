"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { apiFetch, apiFetchPage, errorMessage } from "@/lib/api-client";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { SCOPE_PARAM, portalNames, type ScopedRole } from "@/utils/portal-scope";

/** Portals whose data is one person's (team or own account), so a developer must pick whose. */
export type { ScopedRole };

type ScopeOption = { id: string; name: string; region?: string };

type ScopeStore = {
  options: ScopeOption[];
  selectedId: string | null;
  status: "idle" | "loading" | "loaded" | "error";
  error: string | null;
  loadOptions: () => Promise<void>;
  select: (id: string) => void;
};

const roleNames = portalNames;

function createScopeStore(role: ScopedRole) {
  const storageKey = `${role}-portal:viewing`;
  return create<ScopeStore>((set, get) => ({
    options: [],
    selectedId: null,
    status: "idle",
    error: null,
    loadOptions: async () => {
      if (get().status === "loading") return;
      set({ status: "loading", error: null });
      try {
        const options: ScopeOption[] = [];
        for (let page = 1; page <= 10; page++) {
          const { items, meta } = await apiFetchPage<ScopeOption>(`/api/users?role=${role}&pageSize=100&pageNumber=${page}`);
          options.push(...items);
          if (!meta.hasMore) break;
        }
        options.sort((a, b) => a.name.localeCompare(b.name));
        let stored: string | null = null;
        try {
          stored = window.localStorage.getItem(storageKey);
        } catch {
          // Storage unavailable — fall back to the first option.
        }
        set({
          options,
          selectedId: options.find((option) => option.id === stored)?.id ?? options[0]?.id ?? null,
          status: "loaded",
          error: options.length === 0 ? `There are no ${roleNames[role]} accounts to view yet.` : null,
        });
      } catch (error) {
        set({ status: "error", error: errorMessage(error, `Unable to load ${roleNames[role]} accounts.`) });
      }
    },
    select: (id) => {
      try {
        window.localStorage.setItem(storageKey, id);
      } catch {
        // Best-effort — the choice just won't survive a reload.
      }
      set({ selectedId: id });
    },
  }));
}

const stores: Record<ScopedRole, UseBoundStore<StoreApi<ScopeStore>>> = {
  sro: createScopeStore("sro"),
  ro: createScopeStore("ro"),
  "youth-leader": createScopeStore("youth-leader"),
  volunteer: createScopeStore("volunteer"),
};

/**
 * Whose data a portal shows. A user of that role sees their own (no query
 * param); a developer picks one, sent to the API as `?sroId=` / `?roId=` /
 * `?youthLeaderId=` / `?volunteerId=`.
 */
export function usePortalScope(role: ScopedRole) {
  const { profile } = useCurrentProfile();
  const store = stores[role]();
  const isDeveloper = profile?.role === "developer";

  useEffect(() => {
    if (isDeveloper && store.status === "idle") store.loadOptions();
  }, [isDeveloper, store]);

  const selectedId = isDeveloper ? store.selectedId : null;
  return {
    role,
    roleName: roleNames[role],
    isDeveloper,
    isReady: !!profile && (!isDeveloper || !!store.selectedId),
    /** The team owner's id for a developer; null when viewing your own team. */
    selectedId,
    /** The team owner's id in either case (e.g. for `reportingToId=` filters). */
    ownerId: selectedId ?? profile?.id ?? null,
    options: store.options,
    select: store.select,
    error: isDeveloper ? store.error : null,
  };
}

export function scopedPath(path: string, role: ScopedRole, selectedId: string | null) {
  if (!selectedId) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${SCOPE_PARAM[role]}=${encodeURIComponent(selectedId)}`;
}

/**
 * Loads a portal endpoint for the current scope, reloading when a developer
 * switches whose team they're viewing. Stale responses are ignored.
 */
export function usePortalData<T>(role: ScopedRole, path: string, errorFallback: string) {
  const { isReady, selectedId, error: scopeError } = usePortalScope(role);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    if (scopeError) {
      setError(scopeError);
      setIsLoading(false);
      return;
    }
    if (!isReady) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(scopedPath(path, role, selectedId));
      if (id === requestId.current) setData(result);
    } catch (err) {
      if (id === requestId.current) setError(errorMessage(err, errorFallback));
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [role, path, errorFallback, isReady, selectedId, scopeError]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, isLoading, error, reload };
}

export const useSroScope = () => usePortalScope("sro");
export const useSroData = <T,>(path: string, errorFallback: string) => usePortalData<T>("sro", path, errorFallback);
