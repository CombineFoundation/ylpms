"use client";

import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getUserProfile } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import type { UserProfile } from "@/types/auth.types";

type AuthStatus = "loading" | "unauthenticated" | "authenticated" | "error";

type AuthContextValue = {
  status: AuthStatus;
  firebaseUser: User | null;
  profile: UserProfile | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function errorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return "Incorrect email or password.";
  }
  if (code === "auth/user-disabled") return "This account has been disabled.";
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (error instanceof Error) return error.message;
  return "Authentication failed. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createServerSession = useCallback(async (user: User) => {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: await user.getIdToken() }),
    });
    if (!response.ok) throw new Error("Unable to establish a secure session.");
  }, []);

  const clearServerSession = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
  }, []);

  const loadProfile = useCallback(async (user: User) => {
    const nextProfile = await getUserProfile(user);
    await createServerSession(user);
    setFirebaseUser(user);
    setProfile(nextProfile);
    setError(null);
    setStatus("authenticated");
    return nextProfile;
  }, [createServerSession]);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!active) return;

      if (!user) {
        setFirebaseUser(null);
        setProfile(null);
        setError(null);
        setStatus("unauthenticated");
        return;
      }

      try {
        const nextProfile = await getUserProfile(user);
        await createServerSession(user);
        if (!active) return;
        setFirebaseUser(user);
        setProfile(nextProfile);
        setError(null);
        setStatus("authenticated");
      } catch (nextError) {
        await firebaseSignOut(getFirebaseAuth());
        await clearServerSession().catch(() => undefined);
        if (!active) return;
        setFirebaseUser(null);
        setProfile(null);
        setError(errorMessage(nextError));
        setStatus("error");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [clearServerSession, createServerSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const credential = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password
        );
        return await loadProfile(credential.user);
      } catch (nextError) {
        await firebaseSignOut(getFirebaseAuth());
        await clearServerSession().catch(() => undefined);
        const message = errorMessage(nextError);
        setError(message);
        throw new Error(message);
      }
    },
    [clearServerSession, loadProfile]
  );

  const signOut = useCallback(async () => {
    await clearServerSession().catch(() => undefined);
    await firebaseSignOut(getFirebaseAuth());
  }, [clearServerSession]);

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
    } catch (nextError) {
      throw new Error(errorMessage(nextError));
    }
  }, []);

  const value = useMemo(
    () => ({
      status,
      firebaseUser,
      profile,
      error,
      signIn,
      signOut,
      sendPasswordReset,
    }),
    [status, firebaseUser, profile, error, signIn, signOut, sendPasswordReset]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
