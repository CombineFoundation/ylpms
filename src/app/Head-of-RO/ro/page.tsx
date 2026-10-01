import type { Metadata } from "next";
import { RoList } from "@/components/Head-of-RO/ros/RoList";

export const metadata: Metadata = { title: "Reporting Officers" };

export default function ReportingOfficersPage() {
  return <RoList />;
}
