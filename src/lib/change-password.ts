"use client";

import { z } from "zod";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api-client";

/** Changing your own password: used by Settings and by the first-sign-in page. */
export const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((data) => data.next === data.confirm, { message: "Passwords don't match", path: ["confirm"] })
  .refine((data) => data.next !== data.current, { message: "Choose a different password from your current one", path: ["next"] });
export type PasswordForm = z.infer<typeof passwordSchema>;

/** Where a failed change should show its message: a form field, or the form as a whole. */
export type PasswordChangeError = { field?: "current" | "next"; message: string };

/**
 * Re-checks the current password, sets the new one in Firebase Auth, then
 * tells the server, which lifts the first-sign-in block on new accounts.
 */
export async function changeOwnPassword(current: string, next: string): Promise<void> {
  const authUser = getFirebaseAuth().currentUser;
  if (!authUser || !authUser.email) throw { message: "Please sign in again." } satisfies PasswordChangeError;

  await reauthenticateWithCredential(authUser, EmailAuthProvider.credential(authUser.email, current));
  await updatePassword(authUser, next);
  await apiFetch("/api/auth/password-changed", { method: "POST" });
}

export function passwordChangeError(error: unknown): PasswordChangeError {
  const code = (error as { code?: string } | null)?.code;
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return { field: "current", message: "Current password is incorrect." };
  }
  if (code === "auth/weak-password") return { field: "next", message: "That password is too weak." };
  if (code === "auth/too-many-requests") return { message: "Too many attempts. Please wait a few minutes and try again." };
  if (code === "auth/requires-recent-login") return { message: "For security, please sign out and sign back in, then try again." };
  const message = (error as { message?: string } | null)?.message;
  return { message: !code && message ? message : "Unable to update password. Please try again." };
}
