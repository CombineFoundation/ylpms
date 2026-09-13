import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/types/auth.types";

export const SESSION_COOKIE_NAME = "ylpms_session";

export async function requirePortalAccess(allowedRoles: UserRole[]) {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) redirect("/login");

  try {
    const token = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true);
    const profileSnapshot = await getFirebaseAdminDb().collection("users").doc(token.uid).get();
    const profile = profileSnapshot.data();
    const role = getUserRole(profile?.role);

    if (!profileSnapshot.exists || !role || profile?.active === false) redirect("/login");
    if (role !== "developer" && !allowedRoles.includes(role)) redirect("/login");
  } catch {
    redirect("/login");
  }
}
