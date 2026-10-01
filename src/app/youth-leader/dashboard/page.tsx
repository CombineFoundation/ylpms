import type { Metadata } from "next";
import { DashboardContent } from "@/components/Youth-Leader/dashboard/DashboardContent";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardContent />;
}
