"use client";

import { useEffect } from "react";
import { forceLogout } from "@/utils/session";

let isPatched = false;

/**
 * API calls go through apiFetch, which refreshes the Firebase ID token, so a
 * 401 here means the session is genuinely gone (revoked, user deleted). A 403
 * with code ACCOUNT_DISABLED means the account was deactivated/suspended while
 * signed in. Either way, patch fetch once (app-wide) to sign out and send the
 * user to /login instead of leaving pages stuck on "unable to load" errors.
 */
export function SessionGuard() {
  useEffect(() => {
    if (isPatched) return;
    isPatched = true;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const response = await originalFetch(...args);

      const url = typeof args[0] === "string" ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;
      if (!url.includes("/api/") || url.includes("/api/auth/")) return response;

      const hadToken = !!window.localStorage.getItem("token");
      if (!hadToken) return response;

      if (response.status === 401) {
        forceLogout("expired");
      } else if (response.status === 403) {
        try {
          const body = await response.clone().json();
          if (body?.error?.code === "ACCOUNT_DISABLED") forceLogout("disabled");
          else if (body?.error?.code === "COHORT_CLOSED") {
            // Only certificates stay open after a cohort ends; the portal is the first part of the path.
            const portal = window.location.pathname.split("/")[1];
            if (portal && !window.location.pathname.endsWith("/certificates")) {
              window.location.assign(`/${portal}/certificates`);
            }
          } else if (body?.error?.code === "PASSWORD_CHANGE_REQUIRED" && window.location.pathname !== "/change-password") {
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.assign(`/change-password?next=${next}`);
          }
        } catch {
          // Not JSON — an ordinary permission error, nothing to do.
        }
      }

      return response;
    };
  }, []);

  return null;
}
