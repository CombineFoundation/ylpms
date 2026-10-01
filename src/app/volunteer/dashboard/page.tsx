import type { Metadata } from "next";
import { DashboardContent } from "@/components/volunteer/dashboard/DashboardContent";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardContent />;
}
