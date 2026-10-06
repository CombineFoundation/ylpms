import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

async function clearSession() {
  try {
    await signOut(getFirebaseAuth());
  } catch {
    // Best-effort — we're clearing local session state regardless.
  }
  window.localStorage.removeItem("token");
  document.cookie = "role=; path=/; max-age=0";
}

/**
 * Full page load (not a client-side navigation) so the in-memory stores —
 * profile, portal scope, unread count — start empty for the next user.
 */
export async function signOutUser() {
  await clearSession();
  window.location.assign("/login");
}

/**
 * Used outside the React router context (e.g. a global fetch interceptor) when
 * the cached Firebase ID token is rejected by the API — forces a hard redirect
 * to /login since there's no guarantee a Next.js router instance is available.
 */
export async function forceLogout(reason: "expired" | "disabled" = "expired") {
  if (window.location.pathname === "/login") return;
  await clearSession();
  window.location.assign(`/login?reason=${reason}`);
}
