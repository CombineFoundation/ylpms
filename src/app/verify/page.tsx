import { Suspense } from "react";
import type { Metadata } from "next";
import VerifyCertificateContent from "@/components/VerifyCertificateContent";

export const metadata: Metadata = {
  title: "Verify a certificate | Combine Foundation YLP",
  description: "Check that a Youth Leadership Program certificate is genuine.",
};

/** Public: no sign-in needed. */
export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyCertificateContent />
    </Suspense>
  );
}
