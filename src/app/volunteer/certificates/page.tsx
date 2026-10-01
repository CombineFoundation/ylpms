import type { Metadata } from "next";
import { CertificateList } from "@/components/shared/certificates/CertificateList";

export const metadata: Metadata = { title: "Certificates" };

export default function Page() {
  return <CertificateList portal="volunteer" />;
}
