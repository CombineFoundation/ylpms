import type { Metadata } from "next";
import { SroList } from "@/components/Head-of-RO/sro/SroList";

export const metadata: Metadata = { title: "Senior Reporting Officers" };

export default function SeniorReportingOfficersPage() {
  return <SroList />;
}
