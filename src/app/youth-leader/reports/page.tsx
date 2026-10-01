import type { Metadata } from "next";
import { TeamReportList } from "@/components/SRO/reports/ReportList";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <TeamReportList portal="youth-leader" />;
}
