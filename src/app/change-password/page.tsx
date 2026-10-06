import { Suspense } from "react";
import type { Metadata } from "next";
import ChangePasswordContent from "@/components/ChangePasswordContent";

export const metadata: Metadata = { title: "Set your password" };

export default function ChangePasswordPage() {
  return (
    <Suspense>
      <ChangePasswordContent />
    </Suspense>
  );
}
