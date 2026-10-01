import type { Metadata } from "next";
import { AnalyticsContent } from "@/components/Head-of-RO/analytics/AnalyticsContent";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
