"use client";

import { useState, useCallback, useEffect } from "react";
import { create } from "zustand";
import { apiFetch, apiFetchPage, errorMessage, type PageMeta } from "@/lib/api-client";
import { User, UserRole, UserStatus, CreateUserRequest, UpdateUserRequest } from "@/types/user.types";

/**
 * User hooks. Every request goes through apiFetch, which attaches a fresh
 * Firebase ID token — the previous versions sent no Authorization header and
 * would have been rejected with 401 by every route.
 */

// Zustand store for user state management
interface UserStoreState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  currentUser: null,
  users: [],
  loading: false,
  error: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { currentUser, setCurrentUser, loading, error } = useUserStore();

  const fetchCurrentUser = useCallback(async () => {
    try {
      useUserStore.setState({ loading: true, error: null });
      setCurrentUser(await apiFetch<User>("/api/users/me"));
    } catch (err) {
      useUserStore.setState({ error: errorMessage(err, "Failed to fetch current user") });
    } finally {
      useUserStore.setState({ loading: false });
    }
  }, [setCurrentUser]);

  return { user: currentUser, loading, error, fetchCurrentUser };
}

/**
 * Hook to fetch one page of users with filters
 */
export function useUsers(filters?: {
  role?: UserRole;
  status?: UserStatus;
  reportingToId?: string;
  pageSize?: number;
  pageNumber?: number;
}) {
  const { users, setUsers, error } = useUserStore();
  const [isFetching, setIsFetching] = useState(false);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const filterKey = JSON.stringify(filters || {});

  const fetchUsers = useCallback(async () => {
    try {
      setIsFetching(true);
      useUserStore.setState({ error: null });
      const parsed = JSON.parse(filterKey) as NonNullable<typeof filters>;
      const params = new URLSearchParams();
      if (parsed.role) params.append("role", parsed.role);
      if (parsed.status) params.append("status", parsed.status);
      if (parsed.reportingToId) params.append("reportingToId", parsed.reportingToId);
      if (parsed.pageSize) params.append("pageSize", String(parsed.pageSize));
      if (parsed.pageNumber) params.append("pageNumber", String(parsed.pageNumber));

      const page = await apiFetchPage<User>(`/api/users?${params.toString()}`);
      setUsers(page.items);
      setMeta(page.meta);
    } catch (err) {
      useUserStore.setState({ error: errorMessage(err, "Failed to fetch users") });
    } finally {
      setIsFetching(false);
    }
  }, [filterKey, setUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, meta, loading: isFetching, error, refetch: fetchUsers };
}

/**
 * Hook to fetch single user by ID
 */
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      setUser(await apiFetch<User>(`/api/users/${userId}`));
    } catch (err) {
      setError(errorMessage(err, "Failed to fetch user"));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

/** Wraps a mutation with loading/error state; resolves to the result or null on failure. */
function useMutation<Args extends unknown[], Result>(run: (...args: Args) => Promise<Result>, fallback: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: Args): Promise<Result | null> => {
      try {
        setLoading(true);
        setError(null);
        return await run(...args);
      } catch (err) {
        setError(errorMessage(err, fallback));
        return null;
      } finally {
        setLoading(false);
      }
    },
    // run/fallback are module-level constants at each call site below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { mutate, loading, error };
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const { mutate, loading, error } = useMutation(
    (userData: CreateUserRequest) => apiFetch<User>("/api/users", { method: "POST", body: userData }),
    "Failed to create user"
  );
  return { createUser: mutate, loading, error };
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const { mutate, loading, error } = useMutation(
    (userId: string, userData: UpdateUserRequest) =>
      apiFetch<User>(`/api/users/${userId}`, { method: "PUT", body: userData }),
    "Failed to update user"
  );
  return { updateUser: mutate, loading, error };
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const { mutate, loading, error } = useMutation(
    async (userId: string) => {
      await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
      return true;
    },
    "Failed to delete user"
  );
  return { deleteUser: async (userId: string) => (await mutate(userId)) === true, loading, error };
}

/**
 * Hook to fetch users reporting to a manager
 */
export function useUsersReportingTo(managerId: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!managerId) return;
    try {
      setLoading(true);
      setError(null);
      setUsers(await apiFetch<User[]>(`/api/users/${managerId}/reports`));
    } catch (err) {
      setError(errorMessage(err, "Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}

/**
 * Hook to assign users to a manager
 */
export function useAssignUsers() {
  const { mutate, loading, error } = useMutation(
    async (managerId: string, userIds: string[]) => {
      await apiFetch(`/api/users/${managerId}/assign`, { method: "POST", body: { userIds } });
      return true;
    },
    "Failed to assign users"
  );
  return {
    assignUsers: async (managerId: string, userIds: string[]) => (await mutate(managerId, userIds)) === true,
    loading,
    error,
  };
}

/**
 * Hook to fetch users by role
 */
export function useUsersByRole(role: UserRole) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsers(await apiFetch<User[]>(`/api/users/role/${role}`));
    } catch (err) {
      setError(errorMessage(err, "Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}
