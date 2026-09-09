import { useState, useCallback, useEffect } from "react";
import { create } from "zustand";
import { User, UserRole, UserStatus, CreateUserRequest, UpdateUserRequest } from "@/types/user.types";

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
      useUserStore.setState({ loading: true });
      const response = await fetch("/api/users/me");

      if (!response.ok) {
        throw new Error("Failed to fetch current user");
      }

      const data = await response.json();
      setCurrentUser(data.data);
    } catch (err) {
      useUserStore.setState({
        error: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      useUserStore.setState({ loading: false });
    }
  }, [setCurrentUser]);

  return {
    user: currentUser,
    loading,
    error,
    fetchCurrentUser,
  };
}

/**
 * Hook to fetch all users with filters
 */
export function useUsers(filters?: {
  role?: UserRole;
  status?: UserStatus;
  reportingToId?: string;
  pageSize?: number;
  pageNumber?: number;
}) {
  const { users, setUsers, loading, error } = useUserStore();
  const [isFetching, setIsFetching] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsFetching(true);
      const params = new URLSearchParams();

      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.reportingToId) params.append("reportingToId", filters.reportingToId);
      if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());
      if (filters?.pageNumber) params.append("pageNumber", filters.pageNumber.toString());

      const response = await fetch(`/api/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      useUserStore.setState({
        error: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setIsFetching(false);
    }
  }, [filters, setUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading: isFetching || loading,
    error,
    refetch: fetchUsers,
  };
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
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (userData: CreateUserRequest): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create user");
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createUser, loading, error };
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(
    async (userId: string, userData: UpdateUserRequest): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to update user");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateUser, loading, error };
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to delete user");
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteUser, loading, error };
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
      const response = await fetch(`/api/users/${managerId}/reports`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}

/**
 * Hook to assign users to a manager
 */
export function useAssignUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignUsers = useCallback(
    async (managerId: string, userIds: string[]): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${managerId}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to assign users");
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { assignUsers, loading, error };
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
      const response = await fetch(`/api/users/role/${role}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
