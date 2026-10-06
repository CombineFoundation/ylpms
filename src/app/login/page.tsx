import { Suspense } from "react";
import type { Metadata } from "next";
import LoginContent from "@/components/LoginContent";
import { getPublicStats } from "@/services/public-stats.service";

export const metadata: Metadata = { title: "Sign in | YLPMS" };

/** Impact figures are counted from Firestore; refresh the page at most every 10 minutes. */
export const revalidate = 600;

export default async function LoginPage() {
  const stats = await getPublicStats();
  return (
    <Suspense>
      <LoginContent stats={stats} />
    </Suspense>
  );
}
