"use client";

import { getFirebaseAuth } from "@/lib/firebase";

export type PageMeta = { page: number; pageSize: number; hasMore: boolean };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Returns a valid Firebase ID token. `getIdToken()` transparently refreshes
 * the ~1h token, so long sessions don't get kicked back to /login. Falls
 * back to the token cached at login if Firebase hasn't restored a user yet.
 */
export async function getAuthToken(): Promise<string> {
  const auth = getFirebaseAuth();
  await auth.authStateReady();

  const token = auth.currentUser
    ? await auth.currentUser.getIdToken()
    : window.localStorage.getItem("token");

  if (!token) throw new ApiError("Please sign in again.", 401, "AUTHENTICATION_ERROR");
  window.localStorage.setItem("token", token);
  return token;
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

async function request<T>(path: string, options: ApiFetchOptions = {}): Promise<{ data: T; meta?: PageMeta }> {
  const token = await getAuthToken();
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let result: {
    data?: T;
    meta?: PageMeta;
    error?: { message?: string; code?: string; errors?: Record<string, string[]> };
  } = {};
  try {
    result = await response.json();
  } catch {
    // Non-JSON body (e.g. a platform 502 page) — fall through to a generic error.
  }

  if (!response.ok) {
    throw new ApiError(
      result.error?.message || `Request failed (${response.status}).`,
      response.status,
      result.error?.code,
      result.error?.errors
    );
  }

  return { data: result.data as T, meta: result.meta };
}

/** Authenticated JSON request to our API; resolves to `data`, throws ApiError on failure. */
export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  return (await request<T>(path, options)).data;
}

/** Same as apiFetch, for paginated list endpoints that also return `meta`. */
export async function apiFetchPage<T>(path: string): Promise<{ items: T[]; meta: PageMeta }> {
  const { data, meta } = await request<T[]>(path);
  return {
    items: Array.isArray(data) ? data : [],
    meta: meta || { page: 1, pageSize: Array.isArray(data) ? data.length : 0, hasMore: false },
  };
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
