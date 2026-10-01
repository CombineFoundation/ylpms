import type { Metadata } from "next";
import { TeamCertificates } from "@/components/shared/certificates/TeamCertificates";

export const metadata: Metadata = { title: "Certificates" };

export default function CertificatesPage() {
  return <TeamCertificates portal="head-ro" />;
}
