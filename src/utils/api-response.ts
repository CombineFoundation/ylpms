import { NextResponse } from "next/server";
import { handleError } from "./errors";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export type PageMeta = { page: number; pageSize: number; hasMore: boolean };

export function apiSuccess<T>(data: T, status = 200, meta?: PageMeta) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status });
}

/** Converts any thrown error into the standard error envelope with the right HTTP status. */
export function apiError(error: unknown) {
  const response = handleError(error);
  return NextResponse.json(response, { status: response.error.statusCode || 500 });
}

/** Reads `pageSize`/`pageNumber` query params, clamped to sane bounds. */
export function parsePagination(searchParams: URLSearchParams, defaultPageSize = DEFAULT_PAGE_SIZE) {
  const rawSize = parseInt(searchParams.get("pageSize") || "", 10);
  const rawPage = parseInt(searchParams.get("pageNumber") || "", 10);
  return {
    pageSize: Number.isFinite(rawSize) && rawSize > 0 ? Math.min(rawSize, MAX_PAGE_SIZE) : defaultPageSize,
    pageNumber: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}
