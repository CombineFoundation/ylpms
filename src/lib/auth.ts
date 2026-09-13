import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirestoreDb } from "@/lib/firebase";
import type { UserProfile, UserRole } from "@/types/auth.types";

const roleAliases: Record<string, UserRole> = {
  developer: "developer",
  headro: "head-ro",
  headofro: "head-ro",
  headreportingofficer: "head-ro",
  sro: "sro",
  seniorreportingofficer: "sro",
  ro: "ro",
  reportingofficer: "ro",
  youthleader: "youth-leader",
  volunteer: "volunteer",
};

const dashboardPaths: Record<UserRole, string> = {
  developer: "/Head-of-RO/dashboard",
  "head-ro": "/Head-of-RO/dashboard",
  sro: "/SRO/dashboard",
  ro: "/RO/dashboard",
  "youth-leader": "/youth-leader/dashboard",
  volunteer: "/volunteer/dashboard",
};

export function getUserRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;

  return roleAliases[value.toLowerCase().replace(/[^a-z]/g, "")] ?? null;
}

export function dashboardPathForRole(role: UserRole) {
  return dashboardPaths[role];
}

export async function getUserProfile(user: User): Promise<UserProfile> {
  const profileSnapshot = await getDoc(doc(getFirestoreDb(), "users", user.uid));

  if (!profileSnapshot.exists()) {
    throw new Error("Your account has not been assigned a YLPMS role.");
  }

  const profile = profileSnapshot.data();

  const role = getUserRole(profile.role);

  if (!role) {
    throw new Error("Your account has an invalid YLPMS role.");
  }

  if (profile.active === false) {
    throw new Error("Your YLPMS account has been disabled.");
  }

  if (profile.email && profile.email.toLowerCase() !== user.email?.toLowerCase()) {
    throw new Error("Your YLPMS profile email does not match this account.");
  }

  return {
    email: user.email ?? "",
    name: typeof profile.name === "string" ? profile.name : null,
    role,
  };
}
