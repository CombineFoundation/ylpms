"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SignOutButton({ className }: { className: string }) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <button
      type="button"
      aria-label="Log out"
      onClick={() => void handleSignOut()}
      className={className}
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
