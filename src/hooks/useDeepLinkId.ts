"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Reads `?{param}=` once when the page opens — e.g. a notification linking to
 * one task, activity or report — so the page can open that item. Call
 * `consume` once it's opened (or can't be found) to drop the param from the
 * URL, so a refresh doesn't open it again.
 */
export function useDeepLinkId(param: string) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get(param));
  }, [param]);

  const consume = useCallback(() => {
    setId(null);
    const url = new URL(window.location.href);
    if (!url.searchParams.has(param)) return;
    url.searchParams.delete(param);
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }, [param]);

  return [id, consume] as const;
}

/** The URL param each kind of notification uses to point at its item. */
export const DEEP_LINK_PARAM: Partial<Record<string, string>> = {
  task: "taskId",
  event: "activityId",
  report: "reportId",
};
