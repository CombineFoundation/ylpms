import type { Metadata } from "next";
import { ReportList } from "@/components/SRO/reports/ReportList";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return <ReportList />;
}
