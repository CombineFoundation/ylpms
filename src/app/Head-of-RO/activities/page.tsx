import type { Metadata } from "next";
import { ActivityBoard } from "@/components/shared/activities/ActivityBoard";

export const metadata: Metadata = { title: "Activities" };

export default function ActivitiesPage() {
  return <ActivityBoard portal="head-ro" />;
}
