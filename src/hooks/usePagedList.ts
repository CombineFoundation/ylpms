"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetchPage, errorMessage } from "@/lib/api-client";

/**
 * Loads a paginated list endpoint page by page ("Load more"). `buildUrl`
 * receives the 1-based page number; whenever `key` changes (e.g. a filter),
 * the list resets and reloads from page 1. Nothing loads while `enabled` is
 * false (e.g. until a developer has picked whose portal to view).
 */
export function usePagedList<T>(
  buildUrl: (pageNumber: number) => string,
  key: string,
  errorFallback = "Unable to load data.",
  enabled = true
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildUrlRef = useRef(buildUrl);
  buildUrlRef.current = buildUrl;
  // Ignore responses from a superseded request (filter changed mid-flight).
  const requestId = useRef(0);

  const load = useCallback(
    async (pageNumber: number) => {
      const id = ++requestId.current;
      if (pageNumber === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const { items: pageItems, meta } = await apiFetchPage<T>(buildUrlRef.current(pageNumber));
        if (id !== requestId.current) return;
        setItems((current) => (pageNumber === 1 ? pageItems : [...current, ...pageItems]));
        setPage(pageNumber);
        setHasMore(meta.hasMore);
      } catch (err) {
        if (id !== requestId.current) return;
        setError(errorMessage(err, errorFallback));
      } finally {
        if (id === requestId.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [errorFallback]
  );

  useEffect(() => {
    if (enabled) load(1);
  }, [key, load, enabled]);

  return {
    items,
    setItems,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore: () => load(page + 1),
    reload: () => load(1),
  };
}

/** Upper bound on rows fetched just to search (pages × page size). */
const SEARCH_ROW_LIMIT = 2000;

/**
 * Lists search on the client, so a search would only see the pages loaded so
 * far. While `query` is non-empty this keeps loading pages (up to
 * SEARCH_ROW_LIMIT rows) so the search covers the whole list.
 */
export function useLoadAllWhileSearching(
  list: {
    items: readonly unknown[];
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    loadMore: () => void;
  },
  query: string
) {
  const { hasMore, isLoading, isLoadingMore, error, items, loadMore } = list;
  const isSearching = query.trim().length > 0;
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    if (isSearching && hasMore && !isLoading && !isLoadingMore && !error && items.length < SEARCH_ROW_LIMIT) {
      loadMoreRef.current();
    }
  }, [isSearching, hasMore, isLoading, isLoadingMore, error, items.length]);
}
