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

export async function signOutUser(router: { replace: (href: string) => void }) {
  await clearSession();
  router.replace("/login");
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
